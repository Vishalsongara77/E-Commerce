const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Artisan name is required'],
    trim: true
  },
  tribe: {
    type: String,
    required: [true, 'Tribe name is required']
  },
  region: {
    type: String,
    required: [true, 'Region is required']
  },
  bio: {
    type: String,
    required: [true, 'Bio is required']
  },
  profileImage: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for products
artisanSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'artisanId'
});

module.exports = mongoose.model('Artisan', artisanSchema);
