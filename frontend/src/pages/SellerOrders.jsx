import { useEffect, useState } from 'react'
import { FiPackage, FiShoppingBag, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { ordersAPI } from '../services/api'
import toast from 'react-hot-toast'

const statusMeta = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: FiClock },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-800', icon: FiTruck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: FiPackage }
}

const SellerOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await ordersAPI.getSellerOrders()
        const all = res.data.orders || res.data || []
        setOrders(Array.isArray(all) ? all : [])
      } catch (e) {
        console.error('Failed to load seller orders', e)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    if (user?._id) fetch()
  }, [user?._id])

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId)
      await ordersAPI.updateOrderStatus(orderId, newStatus)
      toast.success(`Order status updated to ${newStatus}`)
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (e) {
      console.error('Failed to update order status', e)
      toast.error(e.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Seller Orders</h1>
        <p className="text-gray-600 mb-8">
          Track and manage orders that include your products.
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <FiShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No orders yet
            </h2>
            <p className="text-gray-600">
              Once customers start ordering your products, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const meta = statusMeta[order.status] || statusMeta.pending
              const firstItem = order.items?.[0]
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                      <FiPackage className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Order #{order.orderNumber || order._id?.slice(-6)}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {firstItem?.product?.name || 'Multiple items'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        Items: {order.items?.length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-right space-y-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}
                    >
                      <meta.icon className="w-3 h-3 mr-1" />
                      {meta.label}
                    </span>
                    <p className="font-semibold text-amber-700">
                      ₹{order.totalAmount || order.total || 0}
                    </p>
                    {/* Seller status update for non-finalised orders */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="mt-1 w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerOrders

