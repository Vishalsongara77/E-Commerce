import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
  const { items, totalAmount, totalItems, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();
  let user;
  
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    user = null;
  }
  const [processingItems, setProcessingItems] = useState(new Set());

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setProcessingItems(prev => new Set(prev).add(productId));
    await updateQuantity(productId, newQuantity);
    setProcessingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleRemoveItem = async (productId) => {
    setProcessingItems(prev => new Set(prev).add(productId));
    await removeFromCart(productId);
    setProcessingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    // Check if user is authenticated or using a demo account
    const token = localStorage.getItem('token');
    if (!token || (!token.includes('demo') && !user)) {
      navigate('/login', { state: { from: '/cart', message: 'Please log in to checkout' } });
      onClose();
      return;
    }
    // Navigate to checkout page using React Router
    onClose();
    navigate('/checkout');
  };

  if (!user || user.role !== 'customer') {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <FiShoppingCart className="text-xl text-amber-600" />
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                  {totalItems}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <FiShoppingCart className="text-4xl mb-4" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm">Add some items to get started</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg"
                    >
                      {/* Product Icon */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiShoppingCart className="w-6 h-6 text-gray-400" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.productName}</h3>
                        <p className="text-xs text-gray-500">by {item.artisanName}</p>
                        <p className="text-sm font-semibold text-amber-600">
                          ₹{item.price}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={processingItems.has(item.productId) || item.quantity <= 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiMinus className="text-sm" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={processingItems.has(item.productId) || item.quantity >= item.stock}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiPlus className="text-sm" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={processingItems.has(item.productId)}
                        className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-amber-600">₹{totalAmount}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={handleClearCart}
                    disabled={loading}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
