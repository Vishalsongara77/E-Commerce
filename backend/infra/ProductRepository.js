const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

/**
 * Product Repository Class
 * Extends BaseRepository with Product-specific operations
 * Implements Single Responsibility Principle: Handles Product-specific database operations
 */
class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Find products by category
   * @param {string} category - Product category
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Products with pagination
   */
  async findByCategory(category, options = {}) {
    const filter = { category, isActive: true };
    return await this.findAll(filter, options);
  }

  /**
   * Find products by seller
   * @param {string} sellerId - Seller user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Products with pagination
   */
  async findBySeller(sellerId, options = {}) {
    const filter = { seller: sellerId };
    return await this.findAll(filter, options);
  }

  /**
   * Find active products by seller
   * @param {string} sellerId - Seller user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Active products with pagination
   */
  async findActiveBySeller(sellerId, options = {}) {
    const filter = { seller: sellerId, isActive: true };
    return await this.findAll(filter, options);
  }

  /**
   * Search products by name or description
   * @param {string} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Matching products with pagination
   */
  async search(searchTerm, options = {}) {
    const filter = {
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    return await this.findAll(filter, options);
  }

  /**
   * Find products by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Products in price range
   */
  async findByPriceRange(minPrice, maxPrice, options = {}) {
    const filter = {
      isActive: true,
      price: { $gte: minPrice, $lte: maxPrice }
    };
    return await this.findAll(filter, options);
  }

  /**
   * Find products with low stock
   * @param {number} threshold - Stock threshold (default: 10)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Low stock products
   */
  async findLowStock(threshold = 10, options = {}) {
    const filter = {
      isActive: true,
      stock: { $lte: threshold }
    };
    return await this.findAll(filter, options);
  }

  /**
   * Find products with populated seller
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Products with seller info
   */
  async findAllWithSeller(filter = {}, options = {}) {
    const populateOptions = {
      path: 'seller',
      select: 'name email phone sellerInfo.businessName sellerInfo.tribe'
    };

    return await this.findAll(
      filter,
      { ...options, populate: populateOptions }
    );
  }

  /**
   * Find product by ID with seller
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Product with seller info
   */
  async findByIdWithSeller(productId) {
    return await this.findById(productId, {
      path: 'seller',
      select: 'name email phone sellerInfo.businessName sellerInfo.tribe avatar'
    });
  }

  /**
   * Update product stock
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to adjust (can be negative)
   * @returns {Promise<Object|null>} Updated product or null
   */
  async updateStock(productId, quantity) {
    try {
      const product = await this.findById(productId);
      if (!product) return null;

      const newStock = product.stock + quantity;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      return await this.updateById(productId, { stock: newStock });
    } catch (error) {
      throw new Error(`Error updating stock: ${error.message}`);
    }
  }

  /**
   * Get featured products
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} Featured products
   */
  async getFeatured(limit = 10) {
    const { data } = await this.findAll(
      { isActive: true },
      {
        sort: { createdAt: -1 },
        limit,
        populate: {
          path: 'seller',
          select: 'name sellerInfo.businessName'
        }
      }
    );
    return data;
  }

  /**
   * Get products by multiple IDs
   * @param {Array} productIds - Array of product IDs
   * @returns {Promise<Array>} Products
   */
  async findByIds(productIds) {
    try {
      const validIds = productIds.filter(id => 
        this.model.base.Types.ObjectId.isValid(id)
      );
      
      return await this.model.find({
        _id: { $in: validIds },
        isActive: true
      });
    } catch (error) {
      throw new Error(`Error finding products by IDs: ${error.message}`);
    }
  }

  /**
   * Check if product is in stock
   * @param {string} productId - Product ID
   * @param {number} quantity - Required quantity
   * @returns {Promise<boolean>} True if in stock
   */
  async isInStock(productId, quantity = 1) {
    try {
      const product = await this.findById(productId);
      if (!product) return false;
      
      return product.isActive && product.stock >= quantity;
    } catch (error) {
      throw new Error(`Error checking stock: ${error.message}`);
    }
  }

  /**
   * Get product statistics
   * @param {string} sellerId - Optional seller ID
   * @returns {Promise<Object>} Product statistics
   */
  async getStats(sellerId = null) {
    try {
      const filter = sellerId ? { seller: sellerId } : {};
      
      const stats = await this.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            totalStock: { $sum: '$stock' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]);

      return stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        totalStock: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0
      };
    } catch (error) {
      throw new Error(`Error getting stats: ${error.message}`);
    }
  }
}

module.exports = ProductRepository;