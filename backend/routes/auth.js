const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const csrfProtection = require('../middleware/csrf');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const buildFrontendUrl = (req) => {
  return (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
};

const buildMailer = () => {
  const emailUser = process.env.EMAIL_USERNAME;
  const emailPass = process.env.EMAIL_PASSWORD;
  if (!emailUser || !emailPass) return null;

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user: emailUser, pass: emailPass }
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian phone number'),
  body('role').isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, role, address, sellerInfo } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      phone,
      role,
      address
    };

    // Add seller specific data if role is seller
    if (role === 'seller' && sellerInfo) {
      userData.sellerInfo = {
        businessName: sellerInfo.businessName,
        description: sellerInfo.description,
        tribe: sellerInfo.tribe,
        region: sellerInfo.region,
        verified: false
      };
    }

    const user = new User(userData);
    await user.save();

    // Send email verification link (best-effort)
    try {
      const verifyToken = user.getEmailVerifyToken();
      await user.save({ validateBeforeSave: false });
      const verifyUrl = `${buildFrontendUrl(req)}/verify-email/${verifyToken}`;
      const mailer = buildMailer();
      if (mailer) {
        const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;
        await mailer.sendMail({
          from: `"Tribal Marketplace" <${fromAddress}>`,
          to: user.email,
          subject: 'Verify your email',
          html: `
            <h1>Verify your email</h1>
            <p>Thanks for registering. Please verify your email to secure your account.</p>
            <a href="${verifyUrl}" target="_blank">Verify Email</a>
            <p>This link expires in 24 hours.</p>
          `
        });
      } else if (process.env.NODE_ENV === 'development') {
        console.log('EMAIL NOT CONFIGURED. Verification URL:', verifyUrl);
      }
    } catch (e) {
      console.warn('Failed to send verification email:', e?.message || e);
    }

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link'
      });
    }

    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email is already verified' });
    }

    const verifyToken = user.getEmailVerifyToken();
    await user.save({ validateBeforeSave: false });
    const verifyUrl = `${buildFrontendUrl(req)}/verify-email/${verifyToken}`;

    const mailer = buildMailer();
    if (!mailer) {
      if (process.env.NODE_ENV === 'development') {
        return res.json({ success: true, message: 'Email not configured; use verifyUrl in development.', verifyUrl });
      }
      return res.status(500).json({ success: false, message: 'Email service is not configured' });
    }

    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;
    await mailer.sendMail({
      from: `"Tribal Marketplace" <${fromAddress}>`,
      to: user.email,
      subject: 'Verify your email',
      html: `
        <h1>Verify your email</h1>
        <p>Please verify your email to continue.</p>
        <a href="${verifyUrl}" target="_blank">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `
    });

    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/google
// @desc    Login/Register with Google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Missing Google credential' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'Google login is not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    const name = payload?.name || 'Google User';
    const picture = payload?.picture || '';
    const googleSub = payload?.sub;

    if (!email || !googleSub) {
      return res.status(400).json({ success: false, message: 'Invalid Google token payload' });
    }

    let user = await User.findOne({ email }).select('+password');

    // If user does NOT exist yet, we may need role selection
    if (!user) {
      const normalizedRole = role === 'seller' ? 'seller' : role === 'buyer' ? 'buyer' : null;

      // No valid role provided -> ask frontend to show buyer/seller choice
      if (!normalizedRole) {
        return res.status(409).json({
          success: false,
          message: 'Choose account type to continue',
          needsRoleSelection: true
        });
      }

      // Create account based on chosen role
      user = new User({
        name,
        email,
        password: crypto.randomBytes(24).toString('hex'),
        phone: '9999999999',
        role: normalizedRole,
        avatar: picture,
        emailVerified: true,
        authProvider: 'google',
        googleId: googleSub,
        isActive: true
      });
      if (normalizedRole === 'seller') {
        user.sellerInfo = user.sellerInfo || {};
        user.sellerInfo.verified = false;
      }
      await user.save();
    } else {
      // Existing user: auto-login with their stored role (no role prompt)
      user.authProvider = 'google';
      user.googleId = user.googleId || googleSub;
      user.avatar = user.avatar || picture;
      user.emailVerified = true;
      await user.save();
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google login' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/csrf-token
// @desc    Get CSRF token
// @access  Public
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'name images price discountPrice')
      .select('-password');

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [auth, csrfProtection], [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[6-9]\d{9}$/),
  body('address.city').optional().trim().isLength({ min: 2, max: 50 }),
  body('address.state').optional().trim().isLength({ min: 2, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, address, sellerInfo } = req.body;
    const user = await User.findById(req.user.id);

    // Update basic fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };

    // Update seller info if user is seller
    if (user.role === 'seller' && sellerInfo) {
      user.sellerInfo = { ...user.sellerInfo, ...sellerInfo };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [auth, csrfProtection], [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password - send reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL (must point to frontend, not the API host)
    const appBaseUrl = buildFrontendUrl(req);
    const resetUrl = `${appBaseUrl}/reset-password/${resetToken}`;
    
    // Create email message
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 10 minutes.</p>
    `;

    try {
      // Always log useful debug info in development
      if (process.env.NODE_ENV === 'development') {
        console.log('==========================================');
        console.log('PASSWORD RESET EMAIL (DEVELOPMENT MODE)');
        console.log('==========================================');
        console.log(`To: ${user.email}`);
        console.log('Reset URL:', resetUrl);
        console.log('==========================================');
      }

      const emailUser = process.env.EMAIL_USERNAME;
      const emailPass = process.env.EMAIL_PASSWORD;

      // If credentials are not configured, return the URL in dev so you can still test the flow
      if (!emailUser || !emailPass) {
        if (process.env.NODE_ENV === 'development') {
          return res.status(200).json({
            success: true,
            message: 'Email is not configured; use the resetUrl to continue in development.',
            resetUrl
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Email service is not configured'
        });
      }

      // Create transporter (works in both development and production)
      const transporter = buildMailer();
      if (!transporter) {
        if (process.env.NODE_ENV === 'development') {
          return res.status(200).json({
            success: true,
            message: 'Email is not configured; use the resetUrl to continue in development.',
            resetUrl
          });
        }
        return res.status(500).json({ success: false, message: 'Email service is not configured' });
      }

      const fromAddress = process.env.EMAIL_FROM || emailUser;

      // Send email
      await transporter.sendMail({
        from: `"Tribal Marketplace" <${fromAddress}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: message
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// @route   POST /api/auth/reset-password/:resetToken
// @desc    Reset password
// @access  Public
router.post('/reset-password/:resetToken', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile retrieval'
    });
  }
});

// @route   POST /api/auth/contact
// @desc    Submit contact form
// @access  Public
router.post('/contact', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // In a real app, we would send an email or store this in a database
    // For now, we'll log it and send a success response
    console.log('Contact form submission:', { name, email, subject, message });

    // Optional: Send email to admin if mailer is configured
    const mailer = buildMailer();
    if (mailer && process.env.EMAIL_USERNAME) {
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: process.env.EMAIL_USERNAME, // Send to yourself (admin)
        subject: `Contact Form: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      };
      await mailer.sendMail(mailOptions);
    }

    res.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!'
    });
  } catch (error) {
    console.error('Contact form submission error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
