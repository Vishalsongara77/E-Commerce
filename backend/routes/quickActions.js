const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/quick-actions
// @desc    Get user-specific quick actions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    let quickActions = [];

    // Define quick actions based on user role
    if (userRole === 'admin') {
      quickActions = [
        {
          id: 'manage-products',
          title: 'Manage Products',
          description: 'View and manage all products',
          icon: 'FiPackage',
          link: '/admin/products',
          color: 'bg-blue-500'
        },
        {
          id: 'user-management',
          title: 'User Management',
          description: 'Manage users and permissions',
          icon: 'FiUsers',
          link: '/admin/users',
          color: 'bg-green-500'
        },
        {
          id: 'order-management',
          title: 'Order Management',
          description: 'Track and manage orders',
          icon: 'FiShoppingCart',
          link: '/admin/orders',
          color: 'bg-purple-500'
        },
        {
          id: 'analytics',
          title: 'Analytics',
          description: 'View detailed analytics',
          icon: 'FiBarChart',
          link: '/admin/analytics',
          color: 'bg-orange-500'
        }
      ];
    } else if (userRole === 'seller') {
      quickActions = [
        {
          id: 'add-product',
          title: 'Add New Product',
          description: 'List a new product for sale',
          icon: 'FiPlus',
          link: '/seller/products/add',
          color: 'bg-green-500'
        },
        {
          id: 'manage-products',
          title: 'Manage Products',
          description: 'View and edit your products',
          icon: 'FiPackage',
          link: '/seller/products',
          color: 'bg-blue-500'
        },
        {
          id: 'view-orders',
          title: 'View Orders',
          description: 'Manage your orders',
          icon: 'FiShoppingCart',
          link: '/seller/orders',
          color: 'bg-purple-500'
        },
        {
          id: 'earnings',
          title: 'Earnings Report',
          description: 'View your earnings',
          icon: 'FiBarChart',
          link: '/seller/earnings',
          color: 'bg-orange-500'
        }
      ];
    } else {
      // Default buyer actions
      quickActions = [
        {
          id: 'browse-products',
          title: 'Browse Products',
          description: 'Discover new tribal crafts',
          icon: 'FiPackage',
          link: '/products',
          color: 'bg-blue-500'
        },
        {
          id: 'my-orders',
          title: 'My Orders',
          description: 'Track your orders',
          icon: 'FiShoppingCart',
          link: '/orders',
          color: 'bg-green-500'
        },
        {
          id: 'wishlist',
          title: 'Wishlist',
          description: 'View saved items',
          icon: 'FiHeart',
          link: '/wishlist',
          color: 'bg-red-500'
        },
        {
          id: 'profile',
          title: 'Profile Settings',
          description: 'Update your profile',
          icon: 'FiUser',
          link: '/profile',
          color: 'bg-purple-500'
        }
      ];
    }

    res.json({
      success: true,
      quickActions
    });
  } catch (error) {
    console.error('Quick actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;