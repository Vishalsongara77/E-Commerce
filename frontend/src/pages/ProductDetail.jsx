import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiMinus, FiPlus, FiHeart, FiArrowLeft, FiLoader } from 'react-icons/fi';
import { productsAPI, wishlistAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import RelatedProducts from '../components/RelatedProducts';
import ProductReviews from '../components/ProductReviews';

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    const storedIds = JSON.parse(localStorage.getItem('wishlistIds') || '[]')
    setIsInWishlist(storedIds.includes(id))
  }, [id])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await productsAPI.getProduct(id)
        setProduct(response.data.product)
        setError(null)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    // Allow all users to add to cart without authentication
    try {
      // Store product details in localStorage for guest cart
      const productDetails = {
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        artisanName: product.artisan?.name || ''
      }
      localStorage.setItem(`product_${product._id}`, JSON.stringify(productDetails))
      
      const result = await addToCart(product._id, quantity)
      if (result.success) {
        setQuantity(1) // Reset quantity after adding to cart
        toast.success('Item added to cart')
      } else if (result.error && result.error.includes('login')) {
        // Create a guest cart in localStorage if server requires authentication
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}')
        
        // Check if product already exists in cart
        const existingItemIndex = guestCart.items.findIndex(item => item.productId === product._id)
        
        if (existingItemIndex >= 0) {
          guestCart.items[existingItemIndex].quantity += quantity
        } else {
          guestCart.items.push({
            productId: product._id,
            productName: product.name,
            price: product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : '',
            artisanName: product.artisan?.name || '',
            quantity: quantity
          })
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart))
        toast.success('Item added to guest cart')
        setQuantity(1) // Reset quantity after adding to cart
      }
    } catch (error) {
      toast.error('Failed to add item to cart')
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      // Check if using a demo token
      const token = localStorage.getItem('token');
      if (token && (token.startsWith('demo-') || token.includes('demo'))) {
        // Demo user - proceed with checkout
        const result = await addToCart(product._id, quantity)
        if (result.success) {
          toast.success('Proceeding to checkout')
          navigate('/checkout')
        }
        return;
      }
      
      toast.error('Please login to continue')
      navigate('/login')
      return
    }

    try {
      const result = await addToCart(product._id, quantity)
      if (result.success) {
        toast.success('Proceeding to checkout')
        navigate('/checkout')
      }
    } catch (error) {
      console.error('Buy now error:', error)
      toast.error('Failed to process your order. Please try again.')
    }
  }

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist')
      return
    }

    try {
      const storedIds = new Set(JSON.parse(localStorage.getItem('wishlistIds') || '[]'))
      let storedItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]')

      if (storedIds.has(product._id)) {
        // Remove from wishlist
        storedIds.delete(product._id)
        storedItems = storedItems.filter((p) => p._id !== product._id)
        setIsInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        // Add to wishlist
        storedIds.add(product._id)
        storedItems.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images || [],
          stock: product.stock ?? 0,
          category: { name: product.category || 'Uncategorized' }
        })
        setIsInWishlist(true)
        toast.success('Added to wishlist')
      }

      localStorage.setItem('wishlistIds', JSON.stringify(Array.from(storedIds)))
      localStorage.setItem('wishlistItems', JSON.stringify(storedItems))

      // Also call the API if needed (keeping original functionality)
      try {
        if (!isInWishlist) {
          await wishlistAPI.addToWishlist(product._id)
        }
      } catch (apiErr) {
        console.warn('API Wishlist update failed, but localStorage updated', apiErr)
      }

      // Let other parts of the app refresh wishlist counts
      window.dispatchEvent(
        new CustomEvent('wishlistUpdated', {
          detail: { count: storedIds.size }
        })
      )
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('Failed to update wishlist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/products"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center text-amber-600 hover:text-amber-700"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg mb-4 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/800x800/C05621/ffffff?text=' + encodeURIComponent(product.name)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-amber-200 rounded-full mx-auto mb-4"></div>
                      <p className="text-amber-700">No Image Available</p>
                    </div>
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${
                        selectedImage === index ? 'border-amber-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/100x100/2F5D50/ffffff?text=IMG'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full mb-2">
                  {product.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>by</span>
                  <Link 
                    to={`/artisan/${product.artisanId?._id || product.artisanId}`} 
                    className="text-terracotta font-bold hover:underline"
                  >
                    {product.artisan?.name || product.seller?.name || 'Tribal Artisan'}
                  </Link>
                  <span className="badge-region">{product.artisan?.region || 'India'}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {Number(product.rating || 0).toFixed(1)} ({product.numReviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-amber-600">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Availability:</span>
                  <span className={`text-sm font-medium ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                  <button 
                    onClick={toggleWishlist}
                    className={`p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                      isInWishlist ? 'bg-red-50' : ''
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${isInWishlist ? 'text-red-600 fill-current' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Reviews */}
        <ProductReviews productId={product?._id} />
        
        {/* Related Products */}
        <RelatedProducts 
          productId={product?._id} 
          category={product?.category?.name || product?.category} 
        />
      </div>
    </div>
  )
}

export default ProductDetail