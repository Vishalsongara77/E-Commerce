import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp, FiPlus, FiEdit, FiTrash2, FiEye, FiUser, FiBookOpen, FiCamera, FiAward } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

const ArtisanDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingOrders: 0
  })
  
  const [products, setProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [onboardingStatus, setOnboardingStatus] = useState({})

  useEffect(() => {
    // Simulate fetching artisan data
    setStats({
      totalProducts: 2,
      totalOrders: 12,
      totalEarnings: 45000,
      pendingOrders: 2
    })

    setProducts([
      {
        id: 1,
        name: 'Handcrafted Rajasthani Pottery Bowl',
        price: 2699,
        stock: 15,
        status: 'active',
        category: 'Handicrafts'
      },
      {
        id: 2,
        name: 'Traditional Beaded Necklace',
        price: 3799,
        stock: 8,
        status: 'active',
        category: 'Jewelry'
      }
    ])

    setRecentOrders([
      {
        id: 'ORD-001',
        customerName: 'Priya Sharma',
        product: 'Handcrafted Pottery Bowl',
        amount: 2699,
        status: 'pending',
        date: '2024-01-15'
      },
      {
        id: 'ORD-002',
        customerName: 'Rahul Kumar',
        product: 'Traditional Beaded Necklace',
        amount: 3799,
        status: 'shipped',
        date: '2024-01-14'
      }
    ])

    setOnboardingStatus({
      profileCompleted: true,
      trainingCompleted: true,
      firstProductListed: true,
      imagingSupport: true
    })
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOnboardingProgress = () => {
    const completed = Object.values(onboardingStatus).filter(Boolean).length
    const total = Object.keys(onboardingStatus).length
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artisan Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your handcrafted products and grow your business</p>
        </div>

        {/* Onboarding Progress */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-sm p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Onboarding Progress</h2>
              <p className="text-amber-100">Complete your setup to maximize your success</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{getOnboardingProgress()}%</div>
              <div className="text-amber-100">Complete</div>
            </div>
          </div>
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${getOnboardingProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Section */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">My Products</h2>
                <Link
                  to="/artisan/products/new"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Product</span>
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">₹{product.price}</span>
                        <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                          {product.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  to="/artisan/products"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  View All Products →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900">#{order.id}</h3>
                        <span className="text-sm font-medium text-gray-900">₹{order.amount}</span>
                      </div>
                      <p className="text-sm text-gray-600">{order.product}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">by {order.customerName}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  to="/artisan/orders"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  View All Orders →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Support & Training Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Support & Training</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/artisan/training"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <FiBookOpen className="w-6 h-6 text-amber-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Training Modules</h3>
                <p className="text-sm text-gray-600">Learn selling tips</p>
              </div>
            </Link>
            
            <Link
              to="/artisan/photography"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <FiCamera className="w-6 h-6 text-amber-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Photography Help</h3>
                <p className="text-sm text-gray-600">Product imaging tips</p>
              </div>
            </Link>
            
            <Link
              to="/artisan/manager"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <FiUser className="w-6 h-6 text-amber-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Account Manager</h3>
                <p className="text-sm text-gray-600">Get personal support</p>
              </div>
            </Link>
            
            <Link
              to="/artisan/achievements"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <FiAward className="w-6 h-6 text-amber-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Achievements</h3>
                <p className="text-sm text-gray-600">Track your progress</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtisanDashboard
