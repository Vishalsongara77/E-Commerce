import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SearchFilter = ({ onSearch, onFilter, categories = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 10000],
    sortBy: 'relevance',
    inStock: false
  });

  // Price ranges for the filter
  const priceRanges = [
    { label: 'All Prices', value: [0, 10000] },
    { label: 'Under ₹500', value: [0, 500] },
    { label: '₹500 - ₹1000', value: [500, 1000] },
    { label: '₹1000 - ₹2000', value: [1000, 2000] },
    { label: '₹2000 - ₹5000', value: [2000, 5000] },
    { label: 'Above ₹5000', value: [5000, 10000] }
  ];

  // Sort options
  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Popularity', value: 'popularity' }
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilter(filters);
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 10000],
      sortBy: 'relevance',
      inStock: false
    });
    onFilter({
      category: '',
      priceRange: [0, 10000],
      sortBy: 'relevance',
      inStock: false
    });
  };

  // Apply filters when they change (for desktop view)
  useEffect(() => {
    if (window.innerWidth >= 768) {
      onFilter(filters);
    }
  }, [filters, onFilter]);

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative mb-4">
        <div className="flex">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search for tribal crafts, jewelry, textiles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:ring-amber-500 focus:border-amber-500"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="submit"
            className="bg-amber-600 text-white px-4 py-2 rounded-r-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden ml-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center"
          >
            <FiFilter className="mr-1" />
            Filter
          </button>
        </div>
      </form>

      {/* Filters - Mobile View (Slide in from right) */}
      <motion.div
        className="md:hidden fixed inset-y-0 right-0 z-50 w-4/5 max-w-sm bg-white shadow-xl"
        initial={{ x: '100%' }}
        animate={{ x: showFilters ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Filters</h3>
          <button
            onClick={() => setShowFilters(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full pb-24">
          {/* Mobile Filter Content */}
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="category-all-mobile"
                    name="category-mobile"
                    checked={filters.category === ''}
                    onChange={() => handleFilterChange('category', '')}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                  />
                  <label htmlFor="category-all-mobile" className="ml-2 text-sm text-gray-700">
                    All Categories
                  </label>
                </div>
                {categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category.id}-mobile`}
                      name="category-mobile"
                      checked={filters.category === category.id}
                      onChange={() => handleFilterChange('category', category.id)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                    />
                    <label htmlFor={`category-${category.id}-mobile`} className="ml-2 text-sm text-gray-700">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-medium mb-2">Price Range</h4>
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`price-${index}-mobile`}
                      name="price-mobile"
                      checked={filters.priceRange[0] === range.value[0] && filters.priceRange[1] === range.value[1]}
                      onChange={() => handleFilterChange('priceRange', range.value)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                    />
                    <label htmlFor={`price-${index}-mobile`} className="ml-2 text-sm text-gray-700">
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h4 className="font-medium mb-2">Sort By</h4>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* In Stock Only */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="in-stock-mobile"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="in-stock-mobile" className="ml-2 text-sm text-gray-700">
                In Stock Only
              </label>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={resetFilters}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Apply
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters - Desktop View (Always visible) */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:gap-4 bg-gray-50 p-4 rounded-md">
        {/* Categories */}
        <div className="mr-6">
          <label htmlFor="category-desktop" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category-desktop"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="mr-6">
          <label htmlFor="price-desktop" className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <select
            id="price-desktop"
            value={`${filters.priceRange[0]}-${filters.priceRange[1]}`}
            onChange={(e) => {
              const [min, max] = e.target.value.split('-').map(Number);
              handleFilterChange('priceRange', [min, max]);
            }}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
          >
            {priceRanges.map((range, index) => (
              <option key={index} value={`${range.value[0]}-${range.value[1]}`}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="mr-6">
          <label htmlFor="sort-desktop" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort-desktop"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* In Stock Only */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="in-stock-desktop"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label htmlFor="in-stock-desktop" className="ml-2 text-sm text-gray-700">
            In Stock Only
          </label>
        </div>

        {/* Reset Filters */}
        <div className="ml-auto">
          <button
            onClick={resetFilters}
            className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;