import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { useCart } from '../contexts/CartContext'

const Wishlist = () => {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sync = () => {
      setLoading(true)
      const storedItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]')
      setWishlistItems(storedItems)
      setLoading(false)
    }

    sync()
    const onWishlistUpdated = () => sync()
    window.addEventListener('wishlistUpdated', onWishlistUpdated)
    return () => window.removeEventListener('wishlistUpdated', onWishlistUpdated)
  }, [])

  const handleRemoveFromWishlist = (productId, silent = false) => {
    const updated = wishlistItems.filter(item => item._id !== productId)
    setWishlistItems(updated)
    localStorage.setItem('wishlistItems', JSON.stringify(updated))
    const ids = updated.map(i => i._id)
    localStorage.setItem('wishlistIds', JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { count: ids.length } }))
    if (!silent) {
      toast.success('Item removed from wishlist')
    }
  }

  const handleAddToCart = async (product) => {
    try {
      const productDetails = {
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        artisanName: product.artisan?.name || ''
      }
      localStorage.setItem(`product_${product._id}`, JSON.stringify(productDetails))

      const result = await addToCart(product._id, 1)
      if (result.success) {
        toast.success(`${product.name} added to cart`)
        // Remove from wishlist after successful add to cart
        handleRemoveFromWishlist(product._id, true)
      } else {
        toast.error(result.error || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Wishlist <span className="text-gray-500 font-semibold">({wishlistItems.length})</span>
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="flex justify-center mb-4">
              <FiHeart className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Browse our products and add items to your wishlist</p>
            <Link to="/products" className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/products/${item._id}`} className="block">
                  <div className="h-48 bg-gray-200 relative">
                    {item.images && item.images.length > 0 ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link to={`/products/${item._id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2">{item.category?.name || 'Uncategorized'}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-amber-600">₹{item.price.toLocaleString()}</span>
                    <span className={`text-sm ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0}
                      className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-gray-200"
                      title="Remove from wishlist"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
