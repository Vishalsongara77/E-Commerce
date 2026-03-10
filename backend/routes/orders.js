const express = require('express');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const csrfProtection = require('../middleware/csrf');
const router = express.Router();

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/seller
// @desc    Get orders that include seller's products
// @access  Private (Seller only)
router.get('/seller', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can access seller orders'
      });
    }

    const allOrders = await Order.find({})
      .populate('items.product', 'name price images seller')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const sellerId = req.user.id.toString();
    const sellerOrders = allOrders.filter(order =>
      order.items?.some(
        (item) =>
          item.product &&
          item.product.seller &&
          item.product.seller.toString() === sellerId
      )
    );

    res.json({
      success: true,
      orders: sellerOrders
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price images description')
      .populate('user', 'name email phone address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', [auth, csrfProtection], async (req, res) => {
  try {
    // Block sellers from placing purchases
    if (req.user.role === 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Seller accounts cannot place orders. Please use a buyer account to purchase products.'
      });
    }

    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Ensure all cart items still have valid products
    const invalidItem = cart.items.find(item => !item.product);
    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: 'Some items in your cart are no longer available. Please update your cart and try again.'
      });
    }

    // Validate all products are still available
    for (const item of cart.items) {
      if (!item.product.isActive || item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" is not available or out of stock`
        });
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((total, item) => {
      const price = typeof item.product.price === 'number' ? item.product.price : 0;
      return total + (price * item.quantity);
    }, 0);

    const shippingCost = 100; // Fixed shipping cost for now
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: typeof item.product.price === 'number' ? item.product.price : 0
      })),
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total,
      status: 'pending',
      notes
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    await order.populate('items.product', 'name price images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin or Seller)
router.put('/:id/status', [auth, csrfProtection], async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('items.product', 'seller');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check permissions:
    // - Admin: can update any order
    // - Buyer: can update own order
    // - Seller: can update orders that include their products
    if (req.user.role === 'admin') {
      // always allowed
    } else if (req.user.role === 'seller') {
      const sellerId = req.user.id.toString();
      const hasOwnItem = (order.items || []).some(
        (item) =>
          item.product &&
          item.product.seller &&
          item.product.seller.toString() === sellerId
      );
      if (!hasOwnItem) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this order'
        });
      }
    } else if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: req.user.id
    });

    await order.save();
    await order.populate('items.product', 'name price images');

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', [auth, csrfProtection], async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      updatedAt: new Date(),
      updatedBy: req.user.id,
      reason
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;