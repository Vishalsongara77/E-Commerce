import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiSettings,
  FiBarChart,
  FiUserCheck,
  FiAlertCircle
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { adminAPI } from '../services/api'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeArtisans: 0
  })

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await adminAPI.getDashboardStats()
        if (response.data.success) {
          setStats(response.data.stats)
        } else {
          console.error('Error fetching stats:', response.data.message)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchDashboardStats()
  }, [])

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'View and manage all products',
      icon: FiPackage,
      link: '/admin/products',
      color: 'bg-blue-500'
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: FiUsers,
      link: '/admin/users',
      color: 'bg-green-500'
    },
    {
      title: 'Order Management',
      description: 'Track and manage orders',
      icon: FiShoppingCart,
      link: '/admin/orders',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: FiBarChart,
      link: '/admin/analytics',
      color: 'bg-orange-500'
    }
  ]

  const recentActivities = [
    { id: 1, action: 'New artisan registration', user: 'Ravi Kumar', time: '2 hours ago' },
    { id: 2, action: 'Product approval needed', user: 'Priya Crafts', time: '4 hours ago' },
    { id: 3, action: 'Order dispute raised', user: 'Customer #1234', time: '6 hours ago' },
    { id: 4, action: 'Payment processed', user: 'System', time: '8 hours ago' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's what's happening with your marketplace.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
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
          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {stats.pendingApprovals}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <FiUserCheck className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Artisan Applications</p>
                      <p className="text-sm text-gray-600">
                        {stats.pendingApprovals} pending seller approvals
                      </p>
                    </div>
                  </div>
                  <Link to="/admin/users" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                    Review
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <FiPackage className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Product Approvals</p>
                      <p className="text-sm text-gray-600">Review and approve new products</p>
                    </div>
                  </div>
                  <Link to="/admin/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Review
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.user} • {activity.time}</p>
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

export default AdminDashboard
