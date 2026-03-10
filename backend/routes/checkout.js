const express = require('express');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const csrfProtection = require('../middleware/csrf');
const router = express.Router();

// @route   POST /api/checkout
// @desc    Process checkout and create order
// @access  Private
router.post('/', [auth, csrfProtection], async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate all products are still available
    for (const item of cart.items) {
      if (!item.product.isActive || item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} is no longer available or has insufficient stock`
        });
      }
    }

    // Calculate order totals
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    const shippingCost = 100; // Fixed shipping cost
    const taxRate = 0.18; // 18% GST
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + shippingCost + tax;

    // Create new order
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total,
      status: 'pending',
      notes,
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'completed',
        paidAt: paymentMethod === 'cod' ? null : new Date()
      }
    });

    // Save order
    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    // Populate order details for response
    await order.populate('items.product', 'name price images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/checkout/validate
// @desc    Validate cart before checkout
// @access  Private
router.get('/validate', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Check product availability
    const unavailableItems = [];
    for (const item of cart.items) {
      if (!item.product.isActive || item.product.stock < item.quantity) {
        unavailableItems.push({
          id: item.product._id,
          name: item.product.name,
          available: item.product.isActive,
          requestedQuantity: item.quantity,
          availableStock: item.product.stock
        });
      }
    }

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items in your cart are no longer available',
        unavailableItems
      });
    }

    res.json({
      success: true,
      message: 'Cart is valid for checkout'
    });
  } catch (error) {
    console.error('Checkout validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;