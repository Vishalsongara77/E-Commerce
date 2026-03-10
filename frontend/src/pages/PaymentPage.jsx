import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiCreditCard, FiLock, FiShoppingBag, 
  FiCalendar, FiInfo, FiCheck, FiLoader 
} from 'react-icons/fi';
import { 
  BsCreditCard2Front, BsPaypal, BsCashCoin 
} from 'react-icons/bs';
import { 
  SiGooglepay, SiPaytm, SiPhonepe 
} from 'react-icons/si';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalAmount, totalItems, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  
  // Get shipping details from location state or set defaults
  const shippingDetails = location.state?.shippingDetails || {};
  const shippingMethod = location.state?.shippingMethod || 'standard';
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Calculate costs
  const shippingCost = shippingMethod === 'express' ? 200 : 100;
  const taxAmount = totalAmount * 0.18;
  const finalTotal = totalAmount + shippingCost + taxAmount;
  
  // Handle input changes for card details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber) {
        errors.cardNumber = 'Card number is required';
      } else if (!/^[0-9]{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      
      if (!cardDetails.cardName) {
        errors.cardName = 'Name on card is required';
      }
      
      if (!cardDetails.expiryDate) {
        errors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardDetails.expiryDate)) {
        errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      }
      
      if (!cardDetails.cvv) {
        errors.cvv = 'CVV is required';
      } else if (!/^[0-9]{3,4}$/.test(cardDetails.cvv)) {
        errors.cvv = 'Please enter a valid CVV';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Generate a random order ID
      const generatedOrderId = 'ORD' + Math.floor(100000 + Math.random() * 900000);
      setOrderId(generatedOrderId);
      setPaymentComplete(true);
      clearCart(); // Clear the cart after successful payment
      setLoading(false);
    }, 2000);
  };
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // If no items in cart, redirect to cart page
  useEffect(() => {
    if (items.length === 0 && !paymentComplete) {
      navigate('/cart');
    }
  }, [items, navigate, paymentComplete]);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-amber-600 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-center flex-1">Payment</h1>
      </div>
      
      {paymentComplete ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-8 text-center"
        >
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FiCheck className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
            
            <div className="bg-gray-50 rounded-lg p-6 w-full max-w-md mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">₹{finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">
                  {paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   paymentMethod === 'paypal' ? 'PayPal' :
                   paymentMethod === 'googlepay' ? 'Google Pay' :
                   paymentMethod === 'upi_phonepe' ? 'PhonePe UPI' :
                   paymentMethod === 'upi_paytm' ? 'Paytm UPI' : 'Cash on Delivery'}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Link 
                to="/orders" 
                className="bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                View Orders
              </Link>
              <Link 
                to="/" 
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-lg">Payment Method</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${
                      paymentMethod === 'card' ? 'border-amber-600 bg-amber-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center">
                        <BsCreditCard2Front className="text-amber-600 mr-2" />
                        <span className="font-medium text-gray-900">Credit/Debit Card</span>
                      </div>
                    </label>
                    <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${
                      paymentMethod === 'paypal' ? 'border-amber-600 bg-amber-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center">
                        <BsPaypal className="text-amber-600 mr-2" />
                        <span className="font-medium text-gray-900">PayPal</span>
                      </div>
                    </label>
                    <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${
                      paymentMethod === 'googlepay' ? 'border-amber-600 bg-amber-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="googlepay"
                        checked={paymentMethod === 'googlepay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center">
                        <SiGooglepay className="text-amber-600 mr-2" />
                        <span className="font-medium text-gray-900">Google Pay</span>
                      </div>
                    </label>
                    <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${
                      paymentMethod === 'upi_phonepe' ? 'border-amber-600 bg-amber-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi_phonepe"
                        checked={paymentMethod === 'upi_phonepe'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center">
                        <SiPhonepe className="text-amber-600 mr-2" />
                        <span className="font-medium text-gray-900">PhonePe UPI</span>
                      </div>
                    </label>
                    <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${
                      paymentMethod === 'upi_paytm' ? 'border-amber-600 bg-amber-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi_paytm"
                        checked={paymentMethod === 'upi_paytm'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center">
                        <SiPaytm className="text-amber-600 mr-2" />
                        <span className="font-medium text-gray-900">Paytm UPI</span>
                      </div>
                    </label>
                    <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${
                      paymentMethod === 'cod' ? 'border-amber-600 bg-amber-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center">
                        <BsCashCoin className="text-amber-600 mr-2" />
                        <span className="font-medium text-gray-900">Cash on Delivery</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePayment}>
                    <div className="mb-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <FiLock className="text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Secure Payment</p>
                            <p className="text-xs text-gray-600">
                              Your payment information is encrypted and secure. We do not store your card details.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                              formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        {formErrors.cardNumber && <p className="mt-1 text-sm text-red-500">{formErrors.cardNumber}</p>}
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={cardDetails.cardName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            formErrors.cardName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.cardName && <p className="mt-1 text-sm text-red-500">{formErrors.cardName}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <div className="relative">
                            <input
                              type="text"
                              id="expiryDate"
                              name="expiryDate"
                              value={cardDetails.expiryDate}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              maxLength="5"
                              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                                formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                          {formErrors.expiryDate && <p className="mt-1 text-sm text-red-500">{formErrors.expiryDate}</p>}
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <div className="relative">
                            <input
                              type="text"
                              id="cvv"
                              name="cvv"
                              value={cardDetails.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              maxLength="4"
                              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                                formErrors.cvv ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            <FiInfo className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                          {formErrors.cvv && <p className="mt-1 text-sm text-red-500">{formErrors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <FiLoader className="animate-spin mr-2" />
                          Processing Payment...
                        </>
                      ) : (
                        `Pay ₹${finalTotal.toFixed(2)}`
                      )}
                    </button>
                  </form>
                )}
                
                {paymentMethod !== 'card' && (
                  <div>
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      {paymentMethod === 'paypal' && (
                        <div className="text-center">
                          <BsPaypal className="text-amber-600 text-4xl mx-auto mb-4" />
                          <p className="text-gray-700 mb-4">You will be redirected to PayPal to complete your payment.</p>
                        </div>
                      )}
                      
                      {paymentMethod === 'googlepay' && (
                        <div className="text-center">
                          <SiGooglepay className="text-amber-600 text-4xl mx-auto mb-4" />
                          <p className="text-gray-700 mb-4">You will be redirected to Google Pay to complete your payment.</p>
                        </div>
                      )}
                      
                      {paymentMethod === 'upi_phonepe' && (
                        <div className="text-center">
                          <SiPhonepe className="text-amber-600 text-4xl mx-auto mb-4" />
                          <p className="text-gray-700 mb-4">You will be redirected to PhonePe to complete your payment.</p>
                        </div>
                      )}
                      
                      {paymentMethod === 'upi_paytm' && (
                        <div className="text-center">
                          <SiPaytm className="text-amber-600 text-4xl mx-auto mb-4" />
                          <p className="text-gray-700 mb-4">You will be redirected to Paytm to complete your payment.</p>
                        </div>
                      )}
                      
                      {paymentMethod === 'cod' && (
                        <div className="text-center">
                          <BsCashCoin className="text-amber-600 text-4xl mx-auto mb-4" />
                          <p className="text-gray-700 mb-4">Pay with cash when your order is delivered.</p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <FiLoader className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        paymentMethod === 'cod' ? 'Place Order' : `Continue to ${
                          paymentMethod === 'paypal' ? 'PayPal' :
                          paymentMethod === 'googlepay' ? 'Google Pay' :
                          paymentMethod === 'upi_phonepe' ? 'PhonePe' :
                          'Paytm'
                        }`
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              
              <div className="mb-4">
                <div className="max-h-60 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center py-2 border-b">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 mr-3">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.productName} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiShoppingBag className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-amber-600">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{shippingCost}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-amber-600">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <FiInfo className="text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Shipping Address</p>
                    <p className="text-xs text-gray-600">
                      {shippingDetails.name}, {shippingDetails.street}, {shippingDetails.city}, {shippingDetails.state} {shippingDetails.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;