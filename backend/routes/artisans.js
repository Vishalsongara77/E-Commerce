const express = require('express');
const { auth } = require('../middleware/auth');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const router = express.Router();

const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// @route   GET /api/artisans
// @desc    Get all artisans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const region = req.query.region;

    let query = { isActive: true };
    if (region) {
      query.region = region;
    }

    const artisans = await Artisan.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Artisan.countDocuments(query);

    res.json({
      success: true,
      artisans,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArtisans: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/artisans/:id
// @desc    Get artisan profile and their products
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Get products by this artisan
    const products = await Product.find({ artisanId: artisan._id, isActive: true })
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      artisan,
      products
    });
  } catch (error) {
    console.error('Get artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/artisans
// @desc    Create an artisan (Admin only)
// @access  Private (Admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, tribe, region, bio, profileImage, user } = req.body;

    const artisan = new Artisan({
      name,
      tribe,
      region,
      bio,
      profileImage,
      user
    });

    await artisan.save();

    res.status(201).json({
      success: true,
      artisan
    });
  } catch (error) {
    console.error('Create artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/artisans/:id
// @desc    Update an artisan
// @access  Private (Admin or Artisan themselves)
router.put('/:id', auth, async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Check permissions: admin or the user associated with the artisan
    if (req.user.role !== 'admin' && artisan.user?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const { name, tribe, region, bio, profileImage, isActive } = req.body;

    if (name) artisan.name = name;
    if (tribe) artisan.tribe = tribe;
    if (region) artisan.region = region;
    if (bio) artisan.bio = bio;
    if (profileImage) artisan.profileImage = profileImage;
    if (isActive !== undefined) artisan.isActive = isActive;

    await artisan.save();

    res.json({
      success: true,
      artisan
    });
  } catch (error) {
    console.error('Update artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
