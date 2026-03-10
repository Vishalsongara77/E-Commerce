import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiShoppingCart, 
  FiHeart, 
  FiPackage,
  FiStar,
  FiTruck,
  FiCreditCard,
  FiUser,
  FiMapPin,
  FiShoppingBag
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { ordersAPI, cartAPI, productsAPI } from '../services/api'
import toast from 'react-hot-toast'

const BuyerDashboard = () => {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    totalSpent: 0,
    rewardPoints: 0
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    const onWishlistUpdated = () => {
      const storedWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]')
      setWishlistItems(
        storedWishlist.map((item) => ({
          id: item._id,
          name: item.name,
          price: item.price,
          seller: item.seller?.sellerInfo?.businessName || item.seller?.name || item.artisan?.name || 'Artisan'
        }))
      )
      setStats((prev) => ({
        ...prev,
        wishlistItems: storedWishlist.length
      }))
    }

    window.addEventListener('wishlistUpdated', onWishlistUpdated)
    return () => window.removeEventListener('wishlistUpdated', onWishlistUpdated)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, cartRes, productsRes] = await Promise.allSettled([
        ordersAPI.getOrders({ limit: 5 }),
        cartAPI.getCart(),
        productsAPI.getProducts({ limit: 6 })
      ])

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.success !== false) {
        const orders = ordersRes.value.data.orders || ordersRes.value.data || []
        setRecentOrders(orders.map(order => ({
          id: order._id,
          product: order.items?.[0]?.product?.name || 'Multiple items',
          amount: order.total || order.pricing?.total || 0,
          status: order.status,
          date: new Date(order.createdAt).toISOString().slice(0, 10),
          seller: order.items?.[0]?.product?.seller?.sellerInfo?.businessName || 'Artisan'
        })))

        const totalOrders = orders.length
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || order.pricing?.total || 0), 0)

        setStats(prev => ({
          ...prev,
          totalOrders,
          totalSpent
        }))
      }

      // Wishlist is localStorage-based in this app
      const storedWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]')
      setWishlistItems(
        storedWishlist.map((item) => ({
          id: item._id,
          name: item.name,
          price: item.price,
          seller: item.seller?.sellerInfo?.businessName || item.seller?.name || item.artisan?.name || 'Artisan'
        }))
      )
      setStats((prev) => ({
        ...prev,
        wishlistItems: storedWishlist.length
      }))

      if (cartRes.status === 'fulfilled') {
        const data = cartRes.value.data
        const items = data.items || data.cart?.items || []
        const totalAmount = data.totalAmount || data.cart?.totalAmount || 0
        setCartItems(items)
        setCartTotal(totalAmount)
      }

      if (productsRes.status === 'fulfilled') {
        const products = productsRes.value.data?.products || productsRes.value.data || []
        const recs = Array.isArray(products) ? products.slice(0, 3) : []
        setRecommendations(recs)
      } else if (recommendations.length === 0) {
        setRecommendations([])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const quickActions = [
    {
      title: 'Browse Products',
      description: 'Discover new tribal crafts',
      icon: FiPackage,
      link: '/products',
      color: 'bg-blue-500'
    },
    {
      title: 'My Orders',
      description: 'Track your orders',
      icon: FiShoppingCart,
      link: '/orders',
      color: 'bg-green-500'
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile',
      icon: FiUser,
      link: '/profile',
      color: 'bg-purple-500'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Shipped':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <FiPackage className="w-4 h-4" />
      case 'Shipped':
        return <FiTruck className="w-4 h-4" />
      case 'Processing':
        return <FiCreditCard className="w-4 h-4" />
      default:
        return <FiPackage className="w-4 h-4" />
    }
  }

  const handleRemoveFromWishlist = (productId) => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]')
    const updated = storedWishlist.filter(item => item._id !== productId)
    localStorage.setItem('wishlistItems', JSON.stringify(updated))
    const ids = updated.map(i => i._id)
    localStorage.setItem('wishlistIds', JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { count: ids.length } }))
  }

  const handleAddWishlistItemToCart = async (itemId) => {
    try {
      const storedItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]')
      const product = storedItems.find((p) => p._id === itemId)

      const productDetails = {
        name: product?.name || wishlistItems.find((w) => w.id === itemId)?.name || 'Product',
        price: product?.price || wishlistItems.find((w) => w.id === itemId)?.price || 0,
        image: product?.images && product.images.length > 0 ? product.images[0] : '',
        artisanName: product?.artisan?.name || ''
      }
      localStorage.setItem(`product_${itemId}`, JSON.stringify(productDetails))

      const result = await addToCart(itemId, 1)
      if (result.success) {
        toast.success(`${productDetails.name} added to cart`)
        // Remove from wishlist after successful add to cart
        handleRemoveFromWishlist(itemId)
      } else {
        toast.error(result.error || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding wishlist item to cart from dashboard:', error)
      toast.error('Failed to add item to cart')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's what's happening with your orders.</p>
          <p className="text-gray-600 mt-2">The Buyer Dashboard lets users browse products, add items to the cart, make secure payments, track orders, view order history, save favorites, and write reviews.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiHeart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiStar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reward Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rewardPoints}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`p-3 ${action.color} rounded-lg w-fit mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* My Cart */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Cart</h3>
              <Link to="/cart" className="text-blue-600 hover:text-blue-700 text-sm">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.product._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-16 w-16 rounded-md overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="h-full w-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                               e.target.src = 'https://placehold.co/100x100/2F5D50/ffffff?text=' + encodeURIComponent(item.product.name)
                             }}
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <FiShoppingBag className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">Your cart is empty.</div>
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="font-medium text-gray-900">Total: ₹{cartTotal.toLocaleString()}</div>
                <Link to="/checkout" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                  Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link to="/orders" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(order.status).replace('text-', 'bg-').replace('-800', '-100')}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">#{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.product}</p>
                        <p className="text-xs text-gray-500">by {order.seller}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{order.amount}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wishlist */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Wishlist</h3>
                <Link to="/wishlist" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">by {item.seller}</p>
                      <p className="text-sm font-medium text-amber-600">₹{item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddWishlistItemToCart(item.id)}
                        className="px-3 py-1 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x300/C05621/ffffff?text=' + encodeURIComponent(item.name)
                        }}
                      />
                    ) : (
                      <FiPackage className="w-12 h-12 text-amber-600" />
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-600">₹{Number(item.price || 0).toLocaleString()}</span>
                    <div className="flex items-center">
                      <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{Number(item.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <Link
                    to={`/products/${item._id}`}
                    className="block text-center w-full mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              ))}
            </div>
            {recommendations.length === 0 && (
              <div className="text-center text-gray-500 py-6">No recommendations available right now.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyerDashboard
