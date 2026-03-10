import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCheckCircle, FiMapPin, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [trackingId, setTrackingId] = useState(orderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mock order statuses for demonstration
  const orderStatuses = [
    { id: 'confirmed', label: 'Order Confirmed', icon: FiCheckCircle, date: '2023-06-10', completed: true },
    { id: 'packed', label: 'Order Packed', icon: FiPackage, date: '2023-06-11', completed: true },
    { id: 'shipped', label: 'Order Shipped', icon: FiTruck, date: '2023-06-12', completed: true },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck, date: '2023-06-14', completed: false },
    { id: 'delivered', label: 'Delivered', icon: FiMapPin, date: '2023-06-15', completed: false }
  ];

  // Mock order details
  const mockOrderDetails = {
    id: 'ORD-123456',
    date: '2023-06-10',
    status: 'shipped',
    items: [
      { id: 1, name: 'Handcrafted Tribal Necklace', price: 1200, quantity: 1, image: 'https://placehold.co/80/C05621/ffffff?text=Necklace' },
      { id: 2, name: 'Bamboo Craft Basket', price: 850, quantity: 2, image: 'https://placehold.co/80/2F5D50/ffffff?text=Basket' }
    ],
    shippingAddress: {
      name: 'Rahul Sharma',
      street: '123 Main Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    },
    trackingNumber: 'TRK-987654321',
    carrier: 'Express Logistics',
    estimatedDelivery: '2023-06-15',
    total: 2900,
    shippingCost: 100,
    tax: 522,
    finalTotal: 3522
  };

  useEffect(() => {
    if (orderId) {
      trackOrder(orderId);
    }
  }, [orderId]);

  const trackOrder = async (id) => {
    if (!id.trim()) {
      toast.error('Please enter a valid order ID');
      return;
    }

    setLoading(true);
    try {
      // In a real application, this would be an API call
      // const response = await orderAPI.trackOrder(id);
      // setOrder(response.data);
      
      // Using mock data for demonstration
      setTimeout(() => {
        setOrder(mockOrderDetails);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to track order. Please check the order ID and try again.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    trackOrder(trackingId);
  };

  const getCurrentStatus = () => {
    if (!order) return null;
    
    const currentStatusIndex = orderStatuses.findIndex(status => status.id === order.status);
    return currentStatusIndex !== -1 ? currentStatusIndex : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link to="/" className="flex items-center text-amber-600 hover:text-amber-700">
            <FiArrowLeft className="mr-2" /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Order Tracking</h1>
          <p className="text-gray-600 mt-2">Track your order status and estimated delivery date</p>
        </div>

        {!order && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  id="trackingId"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your order ID (e.g., ORD-123456)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div className="self-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Tracking...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiSearch className="mr-2" />
                      Track Order
                    </span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order #{order.id}</h2>
                  <p className="text-gray-600 text-sm">Placed on {order.date}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    {orderStatuses.find(status => status.id === order.status)?.label || 'Processing'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <address className="text-sm text-gray-600 not-italic">
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </address>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Information</h3>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Carrier:</span> {order.carrier}</p>
                    <p><span className="font-medium">Tracking Number:</span> {order.trackingNumber}</p>
                    <p><span className="font-medium">Estimated Delivery:</span> {order.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Tracking Timeline */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking Status</h3>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                {orderStatuses.map((status, index) => {
                  const currentStatus = getCurrentStatus();
                  const isCompleted = index <= currentStatus;
                  const isCurrent = index === currentStatus;
                  
                  return (
                    <div key={status.id} className="relative flex items-start mb-6 last:mb-0">
                      <div className={`absolute left-8 -ml-3.5 mt-1.5 w-7 h-7 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                        <status.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-12">
                        <h4 className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                          {status.label}
                        </h4>
                        <p className={`text-xs ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                          {isCompleted ? status.date : 'Pending'}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-green-600 mt-1">Current Status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                      <p className="mt-1 text-sm text-gray-500">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-900 font-medium">₹{order.total.toLocaleString()}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Shipping</p>
                  <p className="text-gray-900 font-medium">₹{order.shippingCost.toLocaleString()}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Tax</p>
                  <p className="text-gray-900 font-medium">₹{order.tax.toLocaleString()}</p>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-base">
                    <p className="font-medium text-gray-900">Total</p>
                    <p className="font-bold text-gray-900">₹{order.finalTotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex justify-between">
              <button
                onClick={() => setOrder(null)}
                className="text-amber-600 hover:text-amber-700 font-medium flex items-center"
              >
                <FiArrowLeft className="mr-2" /> Track Another Order
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/account/orders')}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  View All Orders
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;