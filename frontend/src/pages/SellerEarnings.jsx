import { useEffect, useState } from 'react'
import { FiDollarSign, FiTrendingUp, FiCalendar, FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { ordersAPI } from '../services/api'

const SellerEarnings = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    thisMonth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await ordersAPI.getSellerOrders()
        const sellerOrders = res.data.orders || []
        const sellerId = user?._id

        const calculateSellerEarnings = (order) => {
          return (order.items || []).reduce((sum, item) => {
            if (item.product?.seller === sellerId || item.product?.seller?._id === sellerId) {
              return sum + (item.price * item.quantity)
            }
            return sum
          }, 0)
        }

        const total = sellerOrders.reduce(
          (sum, order) => sum + calculateSellerEarnings(order),
          0
        )
        const now = new Date()
        const monthTotal = sellerOrders
          .filter(o => {
            const d = new Date(o.createdAt)
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          })
          .reduce((sum, o) => sum + calculateSellerEarnings(o), 0)

        setStats({
          totalEarnings: total,
          totalOrders: sellerOrders.length,
          thisMonth: monthTotal
        })
      } catch (e) {
        console.error('Failed to load earnings', e)
        setStats({ totalEarnings: 0, totalOrders: 0, thisMonth: 0 })
      } finally {
        setLoading(false)
      }
    }
    if (user?._id) fetch()
  }, [user?._id])

  if (!user || user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access denied</h1>
          <p className="text-gray-600">Only sellers can view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Earnings Overview</h1>
        <p className="text-gray-600 mb-8">
          See how much you have earned from your tribal creations.
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-5 flex items-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mr-3">
                  <FiDollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{stats.totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-5 flex items-center">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                  <FiShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-5 flex items-center">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mr-3">
                  <FiTrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">This month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{stats.thisMonth.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center mb  -4">
                <FiCalendar className="w-5 h-5 text-amber-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Simple payout information
                </h2>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This is a summary view for the demo. In a production setup this page
                would show detailed payouts per order and settlement status.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SellerEarnings

