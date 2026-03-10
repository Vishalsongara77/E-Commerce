const BaseRepository = require('./BaseRepository');
const Cart = require('../models/Cart');

/**
 * Cart Repository Class
 * Extends BaseRepository with Cart-specific operations
 */
class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  /**
   * Find cart by user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Cart or null
   */
  async findByUser(userId) {
    return await this.findByField('user', userId);
  }

  /**
   * Find cart with populated items
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Cart with products
   */
  async findByUserWithItems(userId) {
    const cart = await this.findByField('user', userId);
    if (!cart) return null;

    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isActive'
    });

    return cart;
  }

  /**
   * Add item to cart
   * @param {string} cartId - Cart ID
   * @param {Object} item - Cart item
   * @returns {Promise<Object|null>} Updated cart
   */
  async addItem(cartId, item) {
    try {
      const cart = await this.findById(cartId);
      if (!cart) return null;

      const existingItemIndex = cart.items.findIndex(
        i => i.product.toString() === item.product.toString()
      );

      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += item.quantity;
      } else {
        cart.items.push(item);
      }

      cart.updatedAt = new Date();
      return await cart.save();
    } catch (error) {
      throw new Error(`Error adding item to cart: ${error.message}`);
    }
  }

  /**
   * Remove item from cart
   * @param {string} cartId - Cart ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Updated cart
   */
  async removeItem(cartId, productId) {
    try {
      const cart = await this.findById(cartId);
      if (!cart) return null;

      cart.items = cart.items.filter(
        item => item.product.toString() !== productId.toString()
      );
      cart.updatedAt = new Date();
      return await cart.save();
    } catch (error) {
      throw new Error(`Error removing item from cart: ${error.message}`);
    }
  }

  /**
   * Clear cart
   * @param {string} cartId - Cart ID
   * @returns {Promise<Object|null>} Updated cart
   */
  async clearCart(cartId) {
    try {
      return await this.updateById(cartId, { items: [], updatedAt: new Date() });
    } catch (error) {
      throw new Error(`Error clearing cart: ${error.message}`);
    }
  }
}

module.exports = CartRepository;