const BaseRepository = require('./BaseRepository');
const Review = require('../models/Review');

/**
 * Review Repository Class
 * Extends BaseRepository with Review-specific operations
 */
class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  /**
   * Find reviews by product
   * @param {string} productId - Product ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Reviews with pagination
   */
  async findByProduct(productId, options = {}) {
    const filter = { product: productId };
    const { populate = {}, ...restOptions } = options;
    
    return await this.findAll(filter, {
      ...restOptions,
      populate: {
        path: 'user',
        select: 'name avatar',
        ...populate
      }
    });
  }

  /**
   * Find reviews by user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Reviews with pagination
   */
  async findByUser(userId, options = {}) {
    const filter = { user: userId };
    return await this.findAll(filter, options);
  }

  /**
   * Get product rating statistics
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Rating statistics
   */
  async getProductRating(productId) {
    try {
      const stats = await this.aggregate([
        { $match: { product: productId } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]);

      const total = await this.count({ product: productId });
      const average = stats.reduce((sum, s) => sum + (s._id * s.count), 0) / total;

      return {
        average: total > 0 ? average.toFixed(2) : 0,
        total,
        distribution: stats.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Error getting product rating: ${error.message}`);
    }
  }
}

module.exports = ReviewRepository;