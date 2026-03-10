import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiX, FiEye } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusIcons = {
    pending: FiClock,
    confirmed: FiCheckCircle,
    processing: FiPackage,
    shipped: FiTruck,
    delivered: FiCheckCircle,
    cancelled: FiX
  };

  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-100',
    confirmed: 'text-blue-600 bg-blue-100',
    processing: 'text-purple-600 bg-purple-100',
    shipped: 'text-indigo-600 bg-indigo-100',
    delivered: 'text-green-600 bg-green-100',
    cancelled: 'text-red-600 bg-red-100'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrders();
      const raw = response.data.orders || response.data || [];
      const data = Array.isArray(raw) ? raw : [];

      // Normalize backend Order model into this UI's expected shape
      const normalized = data.map((o) => {
        const items = Array.isArray(o.items) ? o.items : [];
        return {
          ...o,
          id: o._id || o.id,
          orderNumber: o.orderNumber || (o._id ? String(o._id).slice(-8).toUpperCase() : 'ORDER'),
          totalAmount: o.total ?? o.totalAmount ?? o.pricing?.total ?? 0,
          items: items.map((it) => ({
            ...it,
            productName: it.productName || it.product?.name || 'Product',
            artisanName:
              it.artisanName ||
              it.product?.artisan?.name ||
              it.product?.seller?.name ||
              'Artisan',
            price: it.price ?? it.product?.price ?? 0,
            quantity: it.quantity ?? 1,
            total: (it.price ?? it.product?.price ?? 0) * (it.quantity ?? 1),
          })),
          shippingAddress: {
            fullName: o.shippingAddress?.fullName || o.shippingAddress?.name || '',
            phone: o.shippingAddress?.phone || '',
            street: o.shippingAddress?.street || '',
            city: o.shippingAddress?.city || '',
            state: o.shippingAddress?.state || '',
            zipCode: o.shippingAddress?.zipCode || o.shippingAddress?.pincode || '',
            country: o.shippingAddress?.country || 'India',
          },
        };
      });

      setOrders(normalized);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OrderModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center mt-1">
                  {React.createElement(statusIcons[order.status], {
                    className: `mr-2 ${statusColors[order.status]}`
                  })}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-amber-600">₹{order.totalAmount}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiPackage className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">by {item.artisanName}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.total}</p>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Tracking Info */}
            {order.shippingDetails?.trackingNumber && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Tracking Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-semibold">{order.shippingDetails.trackingNumber}</p>
                  {order.shippingDetails.carrier && (
                    <>
                      <p className="text-sm text-gray-600 mt-2">Carrier</p>
                      <p className="font-semibold">{order.shippingDetails.carrier}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please login to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {user.role === 'buyer' ? 'My Orders' : 'Order Management'}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="text-4xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {user.role === 'buyer' 
                ? "You haven't placed any orders yet." 
                : "No orders to manage at the moment."}
            </p>
            {user.role === 'buyer' && (
              <button
                onClick={() => navigate('/products')}
                className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                        <div className="flex items-center">
                          <StatusIcon className={`mr-1 ${statusColors[order.status]}`} />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p>Order Date</p>
                          <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p>Items</p>
                          <p className="font-medium text-gray-900">{order.items.length} item(s)</p>
                        </div>
                        <div>
                          <p>Total</p>
                          <p className="font-medium text-amber-600">₹{order.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                      >
                        <FiEye />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
