const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

/**
 * User Repository Class
 * Extends BaseRepository with User-specific operations
 * Implements Single Responsibility Principle: Handles User-specific database operations
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User document or null
   */
  async findByEmail(email) {
    return await this.findByField('email', email.toLowerCase());
  }

  /**
   * Find user by phone
   * @param {string} phone - User phone number
   * @returns {Promise<Object|null>} User document or null
   */
  async findByPhone(phone) {
    return await this.findByField('phone', phone);
  }

  /**
   * Find users by role
   * @param {string} role - User role (buyer, seller, admin)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users with pagination
   */
  async findByRole(role, options = {}) {
    return await this.findAll({ role }, options);
  }

  /**
   * Find verified sellers
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Verified sellers with pagination
   */
  async findVerifiedSellers(options = {}) {
    const filter = {
      role: 'seller',
      'sellerInfo.verified': true,
      isActive: true
    };
    return await this.findAll(filter, options);
  }

  /**
   * Find active users only
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Active users with pagination
   */
  async findActiveUsers(options = {}) {
    const filter = { isActive: true };
    return await this.findAll(filter, options);
  }

  /**
   * Update user's last login
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updateLastLogin(userId) {
    return await this.updateById(userId, { lastLogin: new Date() });
  }

  /**
   * Verify user email
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async verifyEmail(userId) {
    return await this.updateById(userId, { emailVerified: true });
  }

  /**
   * Add product to wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async addToWishlist(userId, productId) {
    try {
      const user = await this.findById(userId);
      if (!user) return null;

      if (!user.wishlist.includes(productId)) {
        user.wishlist.push(productId);
        return await user.save();
      }

      return user;
    } catch (error) {
      throw new Error(`Error adding to wishlist: ${error.message}`);
    }
  }

  /**
   * Remove product from wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async removeFromWishlist(userId, productId) {
    try {
      const user = await this.findById(userId);
      if (!user) return null;

      user.wishlist = user.wishlist.filter(
        id => id.toString() !== productId.toString()
      );
      return await user.save();
    } catch (error) {
      throw new Error(`Error removing from wishlist: ${error.message}`);
    }
  }

  /**
   * Get user with populated wishlist
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User with populated wishlist
   */
  async findByIdWithWishlist(userId) {
    return await this.findById(userId, {
      path: 'wishlist',
      select: 'name price images category'
    });
  }

  /**
   * Get user profile (public fields only)
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Public user profile
   */
  async getPublicProfile(userId) {
    try {
      const user = await this.findById(userId, {
        path: 'wishlist',
        select: 'name price images'
      });
      
      if (!user) return null;

      return user.getPublicProfile();
    } catch (error) {
      throw new Error(`Error getting public profile: ${error.message}`);
    }
  }

  /**
   * Check if email is already in use
   * @param {string} email - Email to check
   * @param {string} excludeUserId - User ID to exclude from check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email, excludeUserId = null) {
    const filter = { email: email.toLowerCase() };
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }
    return await this.exists(filter);
  }

  /**
   * Check if phone is already in use
   * @param {string} phone - Phone to check
   * @param {string} excludeUserId - User ID to exclude from check
   * @returns {Promise<boolean>} True if phone exists
   */
  async phoneExists(phone, excludeUserId = null) {
    const filter = { phone };
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }
    return await this.exists(filter);
  }
}

module.exports = UserRepository;