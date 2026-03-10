const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/chat
// @desc    Get chat messages
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      messages: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;