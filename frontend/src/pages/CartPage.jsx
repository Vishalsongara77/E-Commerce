import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const { items, totalAmount, totalItems, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
    if (!isAuthenticated && (!token || !token.includes('demo'))) {
      navigate('/login', { state: { from: '/cart', message: 'Please log in to checkout' } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-offwhite py-12">
      <div className="container-max">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-forest">Your Cart</h1>
            <p className="text-gray-500 mt-1">Review your selected masterpieces</p>
          </div>
          <button 
            onClick={() => navigate('/products')} 
            className="flex items-center text-terracotta font-semibold hover:underline group"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Continue Exploring</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-sand-100">
            <div className="w-16 h-16 border-4 border-sand-200 border-t-terracotta rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Gathering your treasures...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sand-100 p-12 text-center shadow-sm">
            <div className="w-24 h-24 bg-sand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingCart className="text-4xl text-sand-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-forest mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              It looks like you haven't discovered any tribal treasures yet. Explore our collections to find something unique.
            </p>
            <Link 
              to="/products" 
              className="btn btn-primary px-8 py-3 inline-block"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-sand-100 overflow-hidden shadow-sm">
                <div className="divide-y divide-sand-100">
                  {items.map((item) => (
                    <div key={item.productId} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-sand-50 rounded-2xl flex-shrink-0 overflow-hidden border border-sand-100 group-hover:border-terracotta/30 transition-colors">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.productName} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiShoppingCart className="text-sand-200" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-serif font-bold text-forest mb-1 truncate">{item.productName}</h3>
                        {item.artisanName && (
                          <p className="text-sm text-gray-500 mb-2 italic">by {item.artisanName}</p>
                        )}
                        <p className="text-terracotta font-bold text-lg">₹{item.price}</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-sand-50 rounded-xl p-1 border border-sand-100">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={processingItems.has(item.productId) || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-forest hover:bg-white rounded-lg transition-colors disabled:opacity-30"
                        >
                          <FiMinus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-forest">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={processingItems.has(item.productId) || (item.stock && item.quantity >= item.stock)}
                          className="w-8 h-8 flex items-center justify-center text-forest hover:bg-white rounded-lg transition-colors disabled:opacity-30"
                        >
                          <FiPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={processingItems.has(item.productId)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        title="Remove item"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleClearCart}
                className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors ml-4"
              >
                Clear entire cart
              </button>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-forest text-white rounded-3xl p-8 sticky top-28 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h2 className="text-2xl font-serif font-bold mb-8 relative z-10">Order Summary</h2>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between text-sand-50/70">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-white">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sand-50/70">
                    <span>Shipping</span>
                    <span className="text-sand-300 italic text-sm">Free for tribes</span>
                  </div>
                  <div className="border-t border-white/10 pt-6 mt-6">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-serif">Total Amount</span>
                      <div className="text-right">
                        <span className="block text-3xl font-bold text-white">₹{totalAmount}</span>
                        <span className="text-[10px] text-sand-50/40 uppercase tracking-widest">Inclusive of taxes</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full btn btn-primary py-4 text-base font-bold shadow-lg shadow-terracotta/20"
                  >
                    {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                  </button>
                  <p className="text-[10px] text-center text-sand-50/30 px-4">
                    By proceeding, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;