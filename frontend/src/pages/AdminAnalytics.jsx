import { useEffect, useState } from 'react'
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import { adminAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const AdminAnalytics = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeArtisans: 0
  })
  const [analytics, setAnalytics] = useState({
    revenueData: [],
    categorySales: [],
    topSellers: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const [statsRes, analyticsRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getAnalytics()
        ])

        if (statsRes.data?.success && statsRes.data.stats) {
          setStats(statsRes.data.stats)
        }

        if (analyticsRes.data?.success && analyticsRes.data.analytics) {
          setAnalytics(analyticsRes.data.analytics)
        }
      } catch (e) {
        console.error('Failed to load analytics', e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access denied</h1>
          <p className="text-gray-600">Only admins can view analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600 mb-8">
          High-level health of your marketplace. This uses the same data as the
          dashboard but focuses on clean, read-only insights.
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">Total users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-2">
                  <FiShoppingBag className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-500">Total orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
                  <FiDollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-500">Total revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
                  <FiTrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sm text-gray-500">Active artisans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeArtisans.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue over time */}
              <div className="bg-white rounded-xl shadow p-5 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Revenue (last 30 days)</h2>
                  <span className="text-xs text-gray-500">
                    {analytics.revenueData.length} days with orders
                  </span>
                </div>
                {analytics.revenueData.length === 0 ? (
                  <p className="text-sm text-gray-500">No completed orders in the last 30 days.</p>
                ) : (
                  <div className="h-48 flex items-end space-x-1">
                    {analytics.revenueData.map(point => {
                      const max = Math.max(
                        ...analytics.revenueData.map(p => p.revenue || p.revenue === 0 ? p.revenue : 0)
                      ) || 1
                      const height = Math.max(8, (point.revenue / max) * 160)
                      return (
                        <div key={point._id} className="flex-1 flex flex-col items-center group">
                          <div
                            className="w-full bg-amber-500/70 rounded-t-md group-hover:bg-amber-600 transition-colors"
                            style={{ height }}
                            title={`₹${point.revenue.toFixed(0)} on ${point._id}`}
                          />
                          <span className="mt-1 text-[10px] text-gray-400 rotate-45 origin-top-left truncate">
                            {point._id.slice(5)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Category sales */}
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top categories</h2>
                {analytics.categorySales.length === 0 ? (
                  <p className="text-sm text-gray-500">No category sales data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.categorySales.map(cat => {
                      const maxSales = Math.max(
                        ...analytics.categorySales.map(c => c.sales || 0)
                      ) || 1
                      const width = (cat.sales / maxSales) * 100
                      return (
                        <div key={cat._id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-800">{cat._id}</span>
                            <span className="text-gray-500">₹{cat.sales.toFixed(0)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminAnalytics

