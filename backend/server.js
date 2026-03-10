require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import routes
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

const app = express();
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

// Socket.io Setup
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

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

// API Root route as requested
app.get("/", (req, res) => {
  res.send("API is running");
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

// 404 handler
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

if (!isTest && !isProduction) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Tribal Marketplace server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;
