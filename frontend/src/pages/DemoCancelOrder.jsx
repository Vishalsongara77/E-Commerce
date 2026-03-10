import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

const DemoCancelOrder = () => {
  const location = useLocation();
  const newOrder = location.state?.order;
  
  // Default demo orders
  const defaultOrders = [
    {
      id: 'ORD-123456',
      date: '2023-06-15',
      total: 2499,
      status: 'Processing',
      items: [
        { id: 1, name: 'Handcrafted Pottery Bowl', price: 899, quantity: 1, image: 'https://placehold.co/80/C05621/ffffff?text=Bowl' },
        { id: 2, name: 'Tribal Pattern Scarf', price: 1600, quantity: 1, image: 'https://placehold.co/80/2F5D50/ffffff?text=Scarf' }
      ]
    },
    {
      id: 'ORD-789012',
      date: '2023-06-10',
      total: 3299,
      status: 'Shipped',
      items: [
        { id: 3, name: 'Wooden Tribal Mask', price: 1999, quantity: 1, image: 'https://placehold.co/80/C05621/ffffff?text=Mask' },
        { id: 4, name: 'Handwoven Basket', price: 1300, quantity: 1, image: 'https://placehold.co/80/2F5D50/ffffff?text=Basket' }
      ]
    },
    {
      id: 'ORD-345678',
      date: '2023-06-05',
      total: 4599,
      status: 'Delivered',
      items: [
        { id: 5, name: 'Tribal Jewelry Set', price: 2599, quantity: 1, image: 'https://placehold.co/80/C05621/ffffff?text=Jewelry' },
        { id: 6, name: 'Handmade Leather Bag', price: 2000, quantity: 1, image: 'https://placehold.co/80/2F5D50/ffffff?text=Bag' }
      ]
    }
  ];
  
  const [orders, setOrders] = useState(defaultOrders);
  
  // Add the new order from checkout if it exists
  useEffect(() => {
    if (newOrder) {
      setOrders(prev => [newOrder, ...prev]);
      
      // If showCancelOption is true, automatically open the cancel modal
      if (location.state?.showCancelOption) {
        setSelectedOrderId(newOrder.id);
        setShowCancelModal(true);
      }
    }
  }, [newOrder]);

  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = () => {
    if (!cancelReason) {
      alert('Please provide a reason for cancellation');
      return;
    }

    const orderToCancel = orders.find(order => order.id === selectedOrderId);
    
    // Remove from active orders
    setOrders(orders.filter(order => order.id !== selectedOrderId));
    
    // Add to cancelled orders
    setCancelledOrders([...cancelledOrders, {
      ...orderToCancel,
      status: 'Cancelled',
      cancelReason,
      cancelDate: new Date().toISOString().split('T')[0]
    }]);
    
    // Close modal and show success message
    setShowCancelModal(false);
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link to="/" className="flex items-center text-amber-600 hover:text-amber-700">
            <FiArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 ml-auto mr-auto">Demo Order Management</h1>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <FiCheckCircle className="text-green-500 mr-2" />
            Order has been successfully cancelled
          </div>
        )}

        {/* Active Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active orders found
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-medium">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">Placed on {order.date}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-md mr-4"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="font-medium">Total: ₹{order.total}</div>
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Cancelled Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Cancelled Orders</h2>
          
          {cancelledOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No cancelled orders found
            </div>
          ) : (
            <div className="space-y-6">
              {cancelledOrders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 border-red-200 bg-red-50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-medium">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">Placed on {order.date}</p>
                      <p className="text-sm text-red-600">Cancelled on {order.cancelDate}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Cancelled
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-md mr-4"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="font-medium mb-2">Total: ₹{order.total}</div>
                    <div className="bg-red-100 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                      <p className="text-sm text-red-700">{order.cancelReason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="text-red-500 text-xl mr-2" />
              <h3 className="text-lg font-semibold">Cancel Order</h3>
            </div>
            
            <p className="mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Reason for cancellation</label>
              <select 
                value={cancelReason} 
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select a reason</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Shipping takes too long">Shipping takes too long</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Keep Order
              </button>
              <button 
                onClick={confirmCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoCancelOrder;