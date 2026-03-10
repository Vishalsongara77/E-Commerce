const express = require('express');
const { auth } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Stripe = require('stripe');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const buildFrontendUrl = (req) => {
  return (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
};

const computeTotalsFromCart = (cartItems) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = 100;
  const tax = subtotal * 0.18;
  const total = subtotal + shippingCost + tax;
  return { subtotal, shippingCost, tax, total };
};

// @route   POST /api/payments/stripe/create-checkout-session
// @desc    Create Stripe Checkout Session (Card)
// @access  Private
router.post('/stripe/create-checkout-session', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe is not configured' });
    }

    const { shippingAddress, notes } = req.body || {};

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate availability
    for (const item of cart.items) {
      if (!item.product.isActive || item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" is not available or out of stock`
        });
      }
    }

    const { subtotal, shippingCost, tax, total } = computeTotalsFromCart(cart.items);

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping and tax as separate line items (simple approach)
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Tax (GST)' },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    const appBase = buildFrontendUrl(req);
    const successUrl = `${appBase}/payment/stripe/return?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appBase}/checkout`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: shippingAddress?.email,
      metadata: {
        userId: req.user.id.toString(),
        notes: notes || ''
      }
    });

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      totals: { subtotal, shippingCost, tax, total }
    });
  } catch (error) {
    console.error('Stripe Create Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Stripe session'
    });
  }
});

// @route   POST /api/payments/stripe/verify-session
// @desc    Verify Stripe session and create order
// @access  Private
router.post('/stripe/verify-session', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe is not configured' });
    }

    const { sessionId, shippingAddress, paymentMethod = 'card', notes } = req.body || {};
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Missing sessionId' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    // Create order from current cart (cart should still exist until verified)
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    for (const item of cart.items) {
      if (!item.product.isActive || item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" is not available or out of stock`
        });
      }
    }

    const { subtotal, shippingCost, tax, total } = computeTotalsFromCart(cart.items);

    const newOrder = new Order({
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
      status: 'confirmed',
      notes,
    });

    await newOrder.save();

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    cart.items = [];
    await cart.save();

    await newOrder.populate('items.product', 'name price images');

    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Stripe Verify Error:', error);
    res.status(500).json({
      success: false,
      message: 'Stripe verification failed'
    });
  }
});

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails // Contains shippingAddress, items, total, etc.
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Payment is verified, now create the order in our database
    const { shippingAddress, items, subtotal, shippingCost, tax, total, notes } = orderDetails;

    const newOrder = new Order({
      user: req.user.id,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress,
      paymentMethod: 'card', // or 'upi', etc. depending on what was used
      subtotal,
      shippingCost,
      tax,
      total,
      status: 'confirmed',
      notes,
      paymentInfo: {
        id: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: 'completed',
        paidAt: new Date()
      }
    });

    await newOrder.save();

    // 1. Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 2. Clear user's cart
    await Cart.findOneAndDelete({ user: req.user.id });

    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      orderId: newOrder._id
    });

  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

module.exports = router;
