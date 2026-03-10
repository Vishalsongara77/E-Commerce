const express = require('express');
const { auth } = require('../middleware/auth');
const { uploadProductImages, uploadAvatar, handleUploadError } = require('../middleware/upload');
const router = express.Router();

// @route   POST /api/uploads/products
// @desc    Upload product images
// @access  Private (Admin or Seller)
router.post('/products', auth, uploadProductImages.array('images', 5), handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const imageUrls = req.files.map(file => file.path);

    res.json({
      success: true,
      urls: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

// @route   POST /api/uploads/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', auth, uploadAvatar.single('avatar'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      url: req.file.path
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

// @route   POST /api/uploads/artisan
// @desc    Upload artisan profile image
// @access  Private (Admin or Seller)
router.post('/artisan', auth, uploadAvatar.single('profileImage'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      url: req.file.path
    });
  } catch (error) {
    console.error('Artisan upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

module.exports = router;
