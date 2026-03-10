require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import routes
const authRoutes = require('../backend/routes/auth');
const userRoutes = require('../backend/routes/users');
const productRoutes = require('../backend/routes/products');
const categoryRoutes = require('../backend/routes/categories');
const cartRoutes = require('../backend/routes/cart');
const orderRoutes = require('../backend/routes/orders');
const checkoutRoutes = require('../backend/routes/checkout');
const quickActionRoutes = require('../backend/routes/quickActions');
const adminRoutes = require('../backend/routes/admin');
const artisanRoutes = require('../backend/routes/artisans');
const paymentRoutes = require('../backend/routes/payments');
const reviewRoutes = require('../backend/routes/reviews');
const chatRoutes = require('../backend/routes/chat');
const notificationRoutes = require('../backend/routes/notifications');
const uploadRoutes = require('../backend/routes/uploads');

const app = express();

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[Vercel API Request] ${req.method} ${req.url}`);
  next();
});

// Security & CORS
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// MongoDB connection (only if not already connected)
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tribal_marketplace')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// API Root route as requested
app.get("/", (req, res) => {
  res.send("API is running");
});

// Also handle /api specifically as root
app.get("/api", (req, res) => {
  res.send("API is running at /api");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: 'Tribal Marketplace API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/quick-actions', quickActionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

// Fallback for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
