const express = require('express');
const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = [
      { _id: '1', name: 'Jewelry', slug: 'jewelry' },
      { _id: '2', name: 'Textiles', slug: 'textiles' },
      { _id: '3', name: 'Pottery', slug: 'pottery' },
      { _id: '4', name: 'Handicrafts', slug: 'handicrafts' }
    ];

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;