const BaseRepository = require('./BaseRepository');
const Order = require('../models/Order');

/**
 * Order Repository Class
 * Extends BaseRepository with Order-specific operations
 */
class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * Find orders by buyer
   * @param {string} buyerId - Buyer user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Orders with pagination
   */
  async findByBuyer(buyerId, options = {}) {
    const filter = { buyer: buyerId };
    return await this.findAll(filter, options);
  }

  /**
   * Find orders by status
   * @param {string} status - Order status
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Orders with pagination
   */
  async findByStatus(status, options = {}) {
    const filter = { status };
    return await this.findAll(filter, options);
  }

  /**
   * Find orders by seller
   * @param {string} sellerId - Seller user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Orders with pagination
   */
  async findBySeller(sellerId, options = {}) {
    const filter = { 'items.seller': sellerId };
    return await this.findAll(filter, options);
  }

  /**
   * Find order with populated items
   * @param {string} orderId - Order ID
   * @returns {Promise<Object|null>} Order with items
   */
  async findByIdWithItems(orderId) {
    return await this.findById(orderId, {
      path: 'items.product',
      select: 'name price images category'
    });
  }

  /**
   * Get order statistics
   * @param {string} sellerId - Optional seller ID
   * @returns {Promise<Object>} Order statistics
   */
  async getStats(sellerId = null) {
    try {
      const filter = sellerId ? { 'items.seller': sellerId } : {};
      
      const stats = await this.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]);

      return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0
      };
    } catch (error) {
      throw new Error(`Error getting order stats: ${error.message}`);
    }
  }
}

module.exports = OrderRepository;