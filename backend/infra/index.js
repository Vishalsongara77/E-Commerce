/**
 * Repository Pattern Implementation
 * 
 * This module exports all repositories following the Repository Pattern
 * which follows SOLID principles:
 * 
 * - Single Responsibility: Each repository handles one entity type
 * - Open/Closed: Extensible through inheritance, closed for modification
 * - Liskov Substitution: Subclasses can replace base class
 * - Interface Segregation: Provides specific interfaces per entity
 * - Dependency Inversion: Depends on abstract base class, not concrete implementations
 * 
 * Usage:
 * const { UserRepository, ProductRepository } = require('./infra');
 * const userRepo = new UserRepository();
 * const user = await userRepo.findByEmail('user@example.com');
 */

const BaseRepository = require('./BaseRepository');
const UserRepository = require('./UserRepository');
const ProductRepository = require('./ProductRepository');
const OrderRepository = require('./OrderRepository');
const CartRepository = require('./CartRepository');
const ReviewRepository = require('./ReviewRepository');

module.exports = {
  BaseRepository,
  UserRepository,
  ProductRepository,
  OrderRepository,
  CartRepository,
  ReviewRepository
};

// Export as default for convenience
module.exports.default = {
  BaseRepository,
  UserRepository,
  ProductRepository,
  OrderRepository,
  CartRepository,
  ReviewRepository
};