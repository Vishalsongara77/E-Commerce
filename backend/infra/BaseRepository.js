const mongoose = require('mongoose');

/**
 * Base Repository Class implementing Repository Pattern
 * Follows SOLID Principles:
 * - Single Responsibility: Handles basic CRUD operations
 * - Open/Closed: Extensible through inheritance
 * - Liskov Substitution: Subclasses can replace base implementation
 * - Interface Segregation: Provides minimal but complete interface
 * - Dependency Inversion: Depends on Mongoose abstraction, not concrete models
 */
class BaseRepository {
  constructor(model) {
    if (!model) {
      throw new Error('Model is required for repository');
    }
    this.model = model;
  }

  /**
   * Create a new document
   * @param {Object} data - Data to create
   * @returns {Promise<Object>} Created document
   */
  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  /**
   * Create multiple documents
   * @param {Array} dataArray - Array of data objects
   * @returns {Promise<Array>} Created documents
   */
  async createMany(dataArray) {
    try {
      return await this.model.insertMany(dataArray);
    } catch (error) {
      throw new Error(`Error creating multiple documents: ${error.message}`);
    }
  }

  /**
   * Find a document by ID
   * @param {string} id - Document ID
   * @param {Object} populateOptions - Options for population
   * @returns {Promise<Object|null>} Found document or null
   */
  async findById(id, populateOptions = null) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      let query = this.model.findById(id);
      if (populateOptions) {
        query = query.populate(populateOptions);
      }
      
      return await query.exec();
    } catch (error) {
      throw new Error(`Error finding document by ID: ${error.message}`);
    }
  }

  /**
   * Find a document by specific field
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @param {Object} populateOptions - Options for population
   * @returns {Promise<Object|null>} Found document or null
   */
  async findByField(field, value, populateOptions = null) {
    try {
      let query = this.model.findOne({ [field]: value });
      if (populateOptions) {
        query = query.populate(populateOptions);
      }
      
      return await query.exec();
    } catch (error) {
      throw new Error(`Error finding document by field: ${error.message}`);
    }
  }

  /**
   * Find all documents with optional filtering and pagination
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (sort, limit, skip, populate)
   * @returns {Promise<Object>} Object with documents and pagination info
   */
  async findAll(filter = {}, options = {}) {
    try {
      const {
        sort = { createdAt: -1 },
        limit = null,
        skip = 0,
        populate = null,
        select = null
      } = options;

      let query = this.model.find(filter);

      // Apply sorting
      query = query.sort(sort);

      // Apply pagination
      if (limit) {
        query = query.limit(limit).skip(skip);
      }

      // Apply population
      if (populate) {
        query = query.populate(populate);
      }

      // Apply field selection
      if (select) {
        query = query.select(select);
      }

      const documents = await query.exec();
      const total = await this.model.countDocuments(filter);

      return {
        data: documents,
        pagination: {
          total,
          page: Math.floor(skip / (limit || total)) + 1,
          limit: limit || total,
          pages: limit ? Math.ceil(total / limit) : 1
        }
      };
    } catch (error) {
      throw new Error(`Error finding documents: ${error.message}`);
    }
  }

  /**
   * Update a document by ID
   * @param {string} id - Document ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated document or null
   */
  async updateById(id, updateData, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const opts = { new: true, runValidators: true, ...options };
      return await this.model.findByIdAndUpdate(id, updateData, opts);
    } catch (error) {
      throw new Error(`Error updating document by ID: ${error.message}`);
    }
  }

  /**
   * Update multiple documents by filter
   * @param {Object} filter - Filter criteria
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result
   */
  async updateMany(filter, updateData) {
    try {
      return await this.model.updateMany(filter, updateData);
    } catch (error) {
      throw new Error(`Error updating multiple documents: ${error.message}`);
    }
  }

  /**
   * Delete a document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Deleted document or null
   */
  async deleteById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting document by ID: ${error.message}`);
    }
  }

  /**
   * Delete multiple documents by filter
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Object>} Delete result
   */
  async deleteMany(filter) {
    try {
      return await this.model.deleteMany(filter);
    } catch (error) {
      throw new Error(`Error deleting multiple documents: ${error.message}`);
    }
  }

  /**
   * Soft delete (update isActive flag)
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Updated document or null
   */
  async softDelete(id) {
    try {
      return await this.updateById(id, { isActive: false });
    } catch (error) {
      throw new Error(`Error soft deleting document: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted document
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Restored document or null
   */
  async restore(id) {
    try {
      return await this.updateById(id, { isActive: true });
    } catch (error) {
      throw new Error(`Error restoring document: ${error.message}`);
    }
  }

  /**
   * Check if document exists
   * @param {Object} filter - Filter criteria
   * @returns {Promise<boolean>} True if exists
   */
  async exists(filter) {
    try {
      const count = await this.model.countDocuments(filter);
      return count > 0;
    } catch (error) {
      throw new Error(`Error checking document existence: ${error.message}`);
    }
  }

  /**
   * Count documents matching filter
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Count of documents
   */
  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw new Error(`Error counting documents: ${error.message}`);
    }
  }

  /**
   * Aggregate documents
   * @param {Array} pipeline - Aggregation pipeline
   * @returns {Promise<Array>} Aggregation results
   */
  async aggregate(pipeline) {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      throw new Error(`Error aggregating documents: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;