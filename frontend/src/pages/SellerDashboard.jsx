import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiPackage, 
  FiShoppingCart, 
  FiDollarSign,
  FiTrendingUp,
  FiPlus,
  FiEye,
  FiEdit,
  FiBarChart
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI, ordersAPI } from '../services/api'

const SellerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingOrders: 0
  })

  const [recentProducts, setRecentProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [revenueData, setRevenueData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.allSettled([
        productsAPI.getSellerProducts({ limit: 5 }),
        ordersAPI.getSellerOrders()
      ])

      if (productsRes.status === 'fulfilled') {
        const products = productsRes.value.data.products || productsRes.value.data || []
        const latest = Array.isArray(products) ? products.slice(0, 5) : []
        setRecentProducts(latest.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          status: p.isActive ? 'Active' : 'Inactive',
          views: p.views || p.metrics?.views || 0
        })))

        setStats(prev => ({
          ...prev,
          totalProducts: products.length
        }))
      }

      if (ordersRes.status === 'fulfilled') {
        const sellerOrders = ordersRes.value.data.orders || []
        const sellerId = user?._id

        // Calculate earnings specifically for this seller's items in each order
        const calculateSellerEarnings = (order) => {
          return (order.items || []).reduce((sum, item) => {
            if (item.product?.seller === sellerId || item.product?.seller?._id === sellerId) {
              return sum + (item.price * item.quantity)
            }
            return sum
          }, 0)
        }

        setRecentOrders(sellerOrders.slice(0, 5).map(order => ({
          id: order._id,
          product: order.items?.[0]?.product?.name || 'Multiple items',
          amount: calculateSellerEarnings(order),
          status: order.status,
          date: new Date(order.createdAt).toISOString().slice(0, 10)
        })))

        const totalEarnings = sellerOrders.reduce((sum, order) => {
          return sum + calculateSellerEarnings(order)
        }, 0)

        const pendingOrders = sellerOrders.filter(order => order.status === 'pending' || order.status === 'processing').length

        setStats(prev => ({
          ...prev,
          totalOrders: sellerOrders.length,
          totalEarnings,
          pendingOrders
        }))

        // Process revenue data for chart (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - i)
          return d.toISOString().slice(0, 10)
        }).reverse()

        const chartData = last7Days.map(date => {
          const dayEarnings = sellerOrders
            .filter(order => order.createdAt.startsWith(date))
            .reduce((sum, order) => sum + calculateSellerEarnings(order), 0)
          return { date, earnings: dayEarnings }
        })

        setRevenueData(chartData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'List a new product for sale',
      icon: FiPlus,
      link: '/seller/products/add',
      color: 'bg-green-500'
    },
    {
      title: 'Manage Products',
      description: 'View and edit your products',
      icon: FiPackage,
      link: '/seller/products',
      color: 'bg-blue-500'
    },
    {
      title: 'View Orders',
      description: 'Manage your orders',
      icon: FiShoppingCart,
      link: '/seller/orders',
      color: 'bg-purple-500'
    },
    {
      title: 'Earnings Report',
      description: 'View your earnings',
      icon: FiBarChart,
      link: '/seller/earnings',
      color: 'bg-orange-500'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Shipped':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-purple-100 text-purple-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's what's happening with your shop.</p>
          <p className="text-gray-600 mt-2">The Seller Dashboard allows tribal artisans to manage their online shop by adding products, updating details, tracking orders and inventory, viewing earnings, and responding to customer reviews.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Overview Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Earnings Overview</h2>
            <Link to="/seller/earnings" className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
              <FiBarChart className="mr-1" /> Full Report
            </Link>
          </div>
          
          <div className="h-64 flex items-end space-x-2 md:space-x-4">
            {revenueData.map((day, index) => {
              const maxEarnings = Math.max(...revenueData.map(d => d.earnings)) || 1
              const barHeight = (day.earnings / maxEarnings) * 200
              const dayLabel = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full group">
                    <div 
                      className="w-full bg-amber-500 rounded-t-md transition-all duration-300 group-hover:bg-amber-600"
                      style={{ height: `${Math.max(barHeight, 4)}px` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        ₹{day.earnings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="mt-2 text-xs text-gray-500 font-medium">{dayLabel}</span>
                  <span className="text-[10px] text-gray-400">{day.date.slice(8)}</span>
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm border-t pt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Daily Revenue</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="text-gray-600">
              Avg. Daily: <span className="font-bold text-gray-900">
                ₹{(revenueData.reduce((s, d) => s + d.earnings, 0) / (revenueData.length || 1)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
                <Link to="/seller/products" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">₹{product.price}</span>
                        <span className="flex items-center text-sm text-gray-600">
                          <FiEye className="w-4 h-4 mr-1" />
                          {product.views} views
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link to="/seller/orders" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">#{order.id}</h4>
                      <p className="text-sm text-gray-600">{order.product}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
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
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard
