const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  artisan: {
    name: String,
    tribe: String,
    region: String
  },
  artisanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan'
  },
  category: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to update ratings
productSchema.methods.updateRatings = async function() {
  if (this.reviews && this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    const totalRating = this.reviews.reduce((acc, item) => item.rating + acc, 0);
    this.rating = totalRating / this.reviews.length;
  } else {
    this.numReviews = 0;
    this.rating = 0;
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
