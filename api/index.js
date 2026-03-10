require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

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

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://e-commerce-ui-drab.vercel.app",
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// MongoDB connection
if (mongoose.connection.readyState === 0) {
  const uri = process.env.MONGODB_URI;
  mongoose.connect(uri || 'mongodb://localhost:27017/tribal_marketplace', {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err.message));
}

// API Routes mapping
// Vercel routes /api/something to this file. 
// We need to handle /api/something and /something
const router = express.Router();

router.get("/", (req, res) => res.send("API is running"));
router.get("/health", (req, res) => res.json({ success: true, message: 'Tribal Marketplace API is running' }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/quick-actions', quickActionRoutes);
router.use('/admin', adminRoutes);
router.use('/artisans', artisanRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);

// Mount router on both /api and / for maximum compatibility
app.use('/api', router);
app.use('/', router);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
