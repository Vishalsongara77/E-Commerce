require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import routes at the top
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const checkoutRoutes = require('./routes/checkout');
const quickActionRoutes = require('./routes/quickActions');
const adminRoutes = require('./routes/admin');
const artisanRoutes = require('./routes/artisans');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/uploads');
const path = require('path');

const app = express();
const router = express.Router();
const isTest = process.env.NODE_ENV === 'test';

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  });
  app.use('/api/', limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// MongoDB connection
if (!isTest) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tribal_marketplace')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_chat', (data) => {
    socket.join(data.chatId);
  });
  
  socket.on('send_message', (data) => {
    socket.to(data.chatId).emit('receive_message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});



// API routes
// Use the router for all API routes
app.use('/api', router);
// Also mount on root just in case Vercel strips the prefix
app.use('/', router);

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

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tribal Marketplace API is running' });
});

// Root API route
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to the Tribal Marketplace API' });
});

// Fallback for non-existent API routes
router.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// 404 handler for the app
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
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

if (!isTest && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Tribal Marketplace server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;
