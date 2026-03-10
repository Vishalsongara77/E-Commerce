const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  images: [String],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  verified: {
    type: Boolean,
    default: true // Since review is linked to order, it's verified
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per product per order
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

// Virtual for helpful count
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful.length;
});

// Method to toggle helpful
reviewSchema.methods.toggleHelpful = function(userId) {
  const existingIndex = this.helpful.findIndex(h => 
    h.user.toString() === userId.toString()
  );

  if (existingIndex > -1) {
    this.helpful.splice(existingIndex, 1);
  } else {
    this.helpful.push({ user: userId });
  }

  return this.save();
};

// Update product ratings after review save/update/delete
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRatings(this.product);
});

reviewSchema.post('remove', async function() {
  await this.constructor.updateProductRatings(this.product);
});

// Static method to update product ratings
reviewSchema.statics.updateProductRatings = async function(productId) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  if (product) {
    await product.updateRatings();
  }
};

module.exports = mongoose.model('Review', reviewSchema);