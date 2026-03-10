const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerifyToken: String,
  emailVerifyExpire: Date,
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  avatar: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  // Seller specific fields
  sellerInfo: {
    businessName: String,
    description: String,
    tribe: String,
    region: String,
    notifications: [{
      type: { type: String, enum: ['order', 'product_approval', 'verification', 'payment', 'system'], required: true },
      message: { type: String, required: true },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],
    verified: { type: Boolean, default: false },
    verificationDocuments: [String],
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String
    }
  },
  // Buyer specific fields
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerifyToken = function() {
  const verifyToken = crypto.randomBytes(20).toString('hex');
  this.emailVerifyToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');
  // 24 hours
  this.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000;
  return verifyToken;
};

module.exports = mongoose.model('User', userSchema);
