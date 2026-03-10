import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiArrowLeft, FiXCircle } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [loadedOrderDetails, setLoadedOrderDetails] = useState(null)
  
  // Get order details from location state
  const orderDetails = loadedOrderDetails || location.state?.orderDetails;
  const orderId = orderDetails?.orderNumber || orderDetails?.id || orderDetails?._id;

  useEffect(() => {
    const load = async () => {
      if (location.state?.orderDetails) return

      const lastOrderId = localStorage.getItem('lastOrderId')
      if (!lastOrderId) return

      try {
        setLoadingOrder(true)
        const res = await ordersAPI.getOrder(lastOrderId)
        const o = res.data?.order || res.data
        if (!o) return

        setLoadedOrderDetails({
          orderNumber: o._id,
          total: o.total ?? o.totalAmount ?? 0,
          paymentMethod: o.paymentMethod,
          items: (o.items || []).map((it) => ({
            quantity: it.quantity,
            price: it.price,
            name: it.product?.name || it.productName || 'Product'
          })),
          shippingAddress: o.shippingAddress
        })
      } catch (e) {
        // If fetching fails, we'll show the fallback UI below
      } finally {
        setLoadingOrder(false)
      }
    }
    load()
  }, [location.state])
  
  if (loadingOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-2xl text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading your order…</h1>
            <p className="text-gray-600">Please wait a moment.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiXCircle className="text-2xl text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Order Information</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find any order details. Please try placing your order again.
            </p>
            <Link 
              to="/checkout" 
              className="inline-block bg-amber-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Return to Checkout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const openCancelModal = () => {
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleCancelOrder = async () => {
    if (!orderId) {
      toast.error('Cannot cancel order: Order ID not found');
      return;
    }

    if (!cancelReason) {
      toast.error('Please select a reason for cancellation');
      return;
    }

    setCancellingOrder(true);
    try {
      // For demo users or if this is a mock order, just show success
      const token = localStorage.getItem('token');
      const isDemoUser = token && token.includes('demo');
      
      if (isDemoUser || orderDetails.isMockOrder) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        toast.success('Order cancelled successfully');
        setOrderCancelled(true);
        closeCancelModal();
        return;
      }

      // For real users, call the API
      const response = await ordersAPI.cancelOrder(orderId, cancelReason);
      if (response.data && response.data.success) {
        toast.success('Order cancelled successfully');
        setOrderCancelled(true);
        closeCancelModal();
      } else {
        toast.error(response.data?.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setCancellingOrder(false);
    }
  };

  // Clear cart on component mount (guarded to run only once, even in StrictMode)
  const hasClearedRef = React.useRef(false);
  React.useEffect(() => {
    if (!hasClearedRef.current && clearCart) {
      hasClearedRef.current = true;
      // Use a small timeout to ensure the toast appears after page load
      setTimeout(() => {
        clearCart();
      }, 300);
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {orderCancelled ? (
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiXCircle className="text-2xl text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Cancelled</h1>
              <p className="text-gray-600">
                Your order has been cancelled successfully. The amount will be refunded to your original payment method.
              </p>
              <Link 
                to="/" 
                className="mt-6 inline-block bg-amber-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="text-2xl text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-600">
                  Thank you for your order. We'll send you a confirmation email shortly.
                </p>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 my-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{orderId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">₹{orderDetails.total || orderDetails.totalAmount}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{orderDetails.paymentMethod || 'Not specified'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order Status:</span>
                  <span className="font-medium text-green-600">Processing</span>
                </div>
                {orderDetails.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <span className="font-medium">{orderDetails.estimatedDelivery}</span>
                  </div>
                )}
              </div>
              
              {orderDetails.items && orderDetails.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-gray-600">{item.quantity} x </span>
                          <span className="ml-2">{item.productName || item.name || 'Product'}</span>
                        </div>
                        <span className="font-medium">₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col space-y-4 mt-8">
                {/* Large Cancel Order Button */}
                <button 
                  onClick={openCancelModal}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                  disabled={cancellingOrder}
                >
                  <FiXCircle className="mr-2" /> 
                  {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
                </button>
                
                <div className="flex justify-between">
                  <Link 
                    to="/" 
                    className="inline-block border border-amber-600 text-amber-600 py-2 px-6 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <Link to="/order-tracking" className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">
                    Track Order
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Cancel Order</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Reason for cancellation:</label>
              <select 
                value={cancelReason} 
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select a reason</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Shipping time too long">Shipping time too long</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={closeCancelModal}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                disabled={cancellingOrder}
              >
                Keep Order
              </button>
              <button 
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={cancellingOrder}
              >
                {cancellingOrder ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;
