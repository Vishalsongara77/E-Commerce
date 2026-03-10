const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumAmount: {
    type: Number,
    default: 0
  },
  maximumDiscount: {
    type: Number // For percentage coupons
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  userLimit: {
    type: Number,
    default: 1 // How many times a single user can use this coupon
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludeProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderAmount: Number,
    discountAmount: Number
  }]
}, {
  timestamps: true
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function(userId, cartAmount) {
  const now = new Date();
  
  // Check if coupon is active
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }
  
  // Check date validity
  if (now < this.validFrom || now > this.validUntil) {
    return { valid: false, message: 'Coupon has expired or not yet valid' };
  }
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit exceeded' };
  }
  
  // Check minimum amount
  if (cartAmount < this.minimumAmount) {
    return { valid: false, message: `Minimum order amount should be ₹${this.minimumAmount}` };
  }
  
  // Check user usage limit
  const userUsage = this.usedBy.filter(usage => 
    usage.user.toString() === userId.toString()
  ).length;
  
  if (userUsage >= this.userLimit) {
    return { valid: false, message: 'You have already used this coupon' };
  }
  
  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(amount) {
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (amount * this.value) / 100;
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount;
    }
  } else {
    discount = this.value;
  }
  
  return Math.min(discount, amount);
};

// Method to apply coupon
couponSchema.methods.applyCoupon = function(userId, orderAmount, discountAmount) {
  this.usedBy.push({
    user: userId,
    orderAmount,
    discountAmount
  });
  this.usedCount += 1;
  return this.save();
};

module.exports = mongoose.model('Coupon', couponSchema);