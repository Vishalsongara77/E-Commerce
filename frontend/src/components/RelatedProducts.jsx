import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiHeart } from 'react-icons/fi';
import { productsAPI } from '../services/api';

const RelatedProducts = ({ productId, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productId || !category) return;
      
      try {
        setLoading(true);
        // Fetch products in the same category, excluding current product
        const response = await productsAPI.getProducts({ 
          category: category,
          limit: 4
        });
        
        let relatedProducts = response.data.products || response.data;
        
        // Filter out the current product
        relatedProducts = relatedProducts.filter(product => 
          product._id !== productId
        ).slice(0, 4); // Limit to 4 products
        
        setProducts(relatedProducts);
      } catch (error) {
        console.error('Error fetching related products:', error);
        // Fallback data
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, category]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product._id} 
            to={`/products/${product._id}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200">
                {product.images?.[0] || product.image ? (
                  <img 
                    src={product.images?.[0] || product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x300/C05621/ffffff?text=' + encodeURIComponent(product.name)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-100">
                    <span className="text-amber-600">No image</span>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {product.seller?.name || 'Tribal Artisan'}
                </p>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-xs text-gray-600">
                    {Number(product.rating || 0).toFixed(1)} ({product.numReviews || 0})
                  </span>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-600">
                    ₹{product.price?.toLocaleString() || 0}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.originalPrice?.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;