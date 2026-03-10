import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFilter, 
  FiPackage, FiDollarSign, FiUser, FiCalendar, FiStar,
  FiX, FiSave, FiUpload
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, productsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { t } from '../utils/i18n';

const AdminProducts = ({ isAddMode = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    specifications: {
      material: '',
      dimensions: '',
      weight: '',
      care: '',
      origin: ''
    },
    stock: '',
    tags: ''
  });

  const categories = [
    'Jewelry', 'Textiles', 'Pottery', 'Woodwork', 
    'Metalwork', 'Paintings', 'Sculptures', 'Other'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  // If opened in "add mode" (e.g. /seller/products/add), auto-open the Add Product modal
  useEffect(() => {
    if (isAddMode) {
      resetForm();
      setShowAddModal(true);
    }
  }, [isAddMode]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = isAdmin
        ? await adminAPI.getProducts()
        : await productsAPI.getSellerProducts();
      const raw = response.data.products || response.data || [];
      const data = Array.isArray(raw) ? raw : [];
      // Ensure each product has a stable id field for the UI
      setProducts(data.map((p) => ({ ...p, id: p.id || p._id })));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      // Mock data for demo
      setProducts([
        {
          id: '1',
          name: 'Tribal Beaded Necklace',
          description: 'Handcrafted beaded necklace from indigenous artisans',
          price: 45.99,
          category: 'Jewelry',
          artisanName: 'Tribal Crafts Co.',

          stock: 15,
          rating: 4.5,
          numReviews: 12,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Handwoven Tribal Rug',
          description: 'Traditional handwoven rug with tribal patterns',
          price: 89.99,
          category: 'Textiles',
          artisanName: 'Weaving Traditions',

          stock: 8,
          rating: 4.8,
          numReviews: 25,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (selectedProduct) {
        if (isAdmin) {
          await adminAPI.updateProduct(selectedProduct.id, productData);
        } else {
          await productsAPI.updateProduct(selectedProduct.id, productData);
        }
        toast.success('Product updated successfully');
        setShowEditModal(false);
      } else {
        if (isAdmin) {
          await adminAPI.createProduct(productData);
        } else {
          await productsAPI.createProduct(productData);
        }
        toast.success('Product created successfully');
        setShowAddModal(false);
      }
      
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      specifications: product.specifications || {
        material: '',
        dimensions: '',
        weight: '',
        care: '',
        origin: ''
      },
      stock: product.stock?.toString() || '0',
      tags: product.tags?.join(', ') || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (productId) => {
    if (!productId) return;
    if (!window.confirm('Are you sure you want to permanently delete this product?')) {
      return;
    }
    try {
      if (isAdmin) {
        await adminAPI.deleteProduct(productId);
      } else {
        await productsAPI.deleteProduct(productId);
      }
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      specifications: {
        material: '',
        dimensions: '',
        weight: '',
        care: '',
        origin: ''
      },
      stock: '',
      tags: ''
    });
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.artisanName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('Access Denied')}</h1>
          <p className="text-gray-600">
            {t('You need admin or seller privileges to access this page.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Product Management')}</h1>
            <p className="text-gray-600">{t('Manage all products in the marketplace')}</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="mt-4 md:mt-0 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>{t('Add Product')}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, descriptions, or artisans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">{t('All Categories')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-32 bg-gray-200 relative flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/400x200/C05621/ffffff?text=' +
                          encodeURIComponent(product.name || 'Product');
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Stock: {product.stock || 0}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <span className="text-lg font-bold text-amber-600">₹{product.price}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <FiUser className="w-4 h-4 mr-1" />
                      {product.artisanName}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{product.category}</span>
                  </div>
                  
                  {product.rating !== undefined && (
                    <div className="flex items-center mb-3">
                      <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {Number(product.rating || 0).toFixed(1)} ({product.numReviews || 0} reviews)
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      <FiCalendar className="w-3 h-3 inline mr-1" />
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        <AnimatePresence>
          {(showAddModal || showEditModal) && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedProduct ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowAddModal(false);
                          setShowEditModal(false);
                          resetForm();
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiX className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (₹) *
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity *
                          </label>
                          <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            required
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          placeholder="handmade, traditional, tribal"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Material
                            </label>
                            <input
                              type="text"
                              name="specifications.material"
                              value={formData.specifications.material}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dimensions
                            </label>
                            <input
                              type="text"
                              name="specifications.dimensions"
                              value={formData.specifications.dimensions}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Weight
                            </label>
                            <input
                              type="text"
                              name="specifications.weight"
                              value={formData.specifications.weight}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Origin
                            </label>
                            <input
                              type="text"
                              name="specifications.origin"
                              value={formData.specifications.origin}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Care Instructions
                          </label>
                          <textarea
                            name="specifications.care"
                            value={formData.specifications.care}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddModal(false);
                            setShowEditModal(false);
                            resetForm();
                          }}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
                        >
                          <FiSave className="w-4 h-4" />
                          <span>{selectedProduct ? 'Update Product' : 'Create Product'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminProducts;
