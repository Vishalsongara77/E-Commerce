import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiMapPin, FiShoppingBag, FiArrowLeft, FiLoader, FiTruck, FiInfo, FiCheckCircle, FiPackage, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';
import { BsCashCoin, BsCreditCard2Front } from 'react-icons/bs';
import { useCart } from '../contexts/CartContext';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ordersAPI, paymentsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const Checkout = () => {
  const { items, totalAmount, totalItems, loading: cartLoading, clearCart } = useCart();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      toast.error('Online card and UPI payments are disabled in this demo. Please use Cash on Delivery.');
      return;
    }

    const res = await loadRazorpay();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      setLoading(true);
      const orderResponse = await paymentsAPI.createOrder({
        amount: finalTotal,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });

      if (!orderResponse.data.success) {
        throw new Error('Failed to create Razorpay order');
      }

      const { amount, id: order_id, currency } = orderResponse.data.order;

      const options = {
        key: razorpayKey,
        amount: amount.toString(),
        currency: currency,
        name: 'Tribal Marketplace',
        description: 'Authentic Tribal Handicrafts',
        image: '/logo.png',
        order_id: order_id,
        handler: async (response) => {
          try {
            const verifyResponse = await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                shippingAddress,
                items: items.map(item => ({
                  product: item.product?._id || item._id,
                  quantity: item.quantity,
                  price: item.product?.price || item.price
                })),
                subtotal: totalAmount,
                shippingCost,
                tax: taxAmount,
                total: finalTotal,
                notes
              }
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              navigate('/order-confirmation', { 
                state: { 
                  orderDetails: {
                    orderNumber: verifyResponse.data.orderId,
                    total: finalTotal,
                    items: items,
                    shippingAddress,
                    estimatedDelivery: deliveryDate
                  }
                }
              });
              clearCart();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Verification Error:', error);
            toast.error('Error verifying payment');
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        notes: {
          address: `${shippingAddress.street}, ${shippingAddress.city}`
        },
        theme: {
          color: '#C05621' // Terracotta
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Could not initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    try {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      if (!stripeKey) {
        toast.error('Stripe is not configured. Please use Cash on Delivery.')
        return
      }

      // Persist shipping info for the return page
      localStorage.setItem('checkout_shippingAddress', JSON.stringify(shippingAddress))
      localStorage.setItem('checkout_notes', notes || '')

      setLoading(true)
      const res = await paymentsAPI.createStripeCheckoutSession({
        shippingAddress,
        notes
      })
      if (res.data?.success && res.data.url) {
        window.location.href = res.data.url
        return
      }
      toast.error(res.data?.message || 'Failed to start Stripe payment')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to start Stripe payment')
    } finally {
      setLoading(false)
    }
  }
  
  const [activeStep, setActiveStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5); // Delivery in 5 days
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  });

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    email: user?.email || '',
    addressType: 'home'
  });
  
  const [formErrors, setFormErrors] = useState({});

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '' }); // kept for future Stripe Elements
  const [notes, setNotes] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  // Shipping cost based on method
  const shippingCost = shippingMethod === 'express' ? 150 : 50;
  
  // Calculate tax (18% GST)
  const taxAmount = totalAmount * 0.18;
  
  // Final total
  const finalTotal = totalAmount + shippingCost + taxAmount;

  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't redirect demo users with items in cart
    const token = localStorage.getItem('token');
    const isDemoUser = token && token.includes('demo');
    
    if (cartLoading || (totalItems === 0 && !isDemoUser)) {
      navigate('/cart');
    }
  }, [cartLoading, totalItems, navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!shippingAddress.name.trim()) errors.name = 'Name is required';
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone is required';
    if (!shippingAddress.street.trim()) errors.street = 'Street address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State is required';
    if (!shippingAddress.pincode.trim()) errors.pincode = 'PIN code is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      // Validate shipping address before proceeding
      if (!validateForm()) {
        toast.error('Please fill all required shipping fields');
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Validate payment availability before proceeding
      if (paymentMethod === 'card') {
        const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        if (!stripeKey) {
          toast.error('Card payments are not configured. Please use Cash on Delivery.')
          return
        }
      }
      setActiveStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      setActiveStep(1);
      return;
    }

    // Stripe for Card payments (preferred when configured)
    if (paymentMethod === 'card') {
      await handleStripePayment()
      return
    }

    // For COD or other methods, use the backend cart-based order creation
    try {
      setLoading(true);

      const apiPayload = {
        shippingAddress,
        paymentMethod,
        notes
      };

      const response = await ordersAPI.createOrder(apiPayload);
      
      if (response.data.success) {
        const createdOrder = response.data.order;
        try {
          localStorage.setItem('lastOrderId', createdOrder?._id || '')
        } catch {}
        toast.success('Order placed successfully!');
        navigate('/order-confirmation', { 
          state: {
            orderDetails: {
              orderNumber: createdOrder._id,
              total: createdOrder.total,
              items: createdOrder.items,
              shippingAddress: createdOrder.shippingAddress,
              estimatedDelivery: deliveryDate
            }
          }
        });
        clearCart();
      }
    } catch (error) {
      console.error('Order Error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated or has a demo token
  const token = localStorage.getItem('token');
  const isDemoUser = token && token.includes('demo');
  
  if (!isAuthenticated && !isDemoUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiInfo className="text-2xl text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to complete your checkout process.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/login" 
              className="inline-block bg-amber-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="inline-block border border-amber-600 text-amber-600 py-2 px-6 rounded-lg font-medium hover:bg-amber-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link to="/cart" className="text-amber-600 hover:text-amber-700 flex items-center justify-center">
              <FiArrowLeft className="mr-2" />
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // We no longer need the orderPlaced state as we're redirecting to OrderConfirmation page

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link to="/cart" className="text-amber-600 hover:text-amber-700 flex items-center">
            <FiArrowLeft className="mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-2xl font-bold text-center flex-1">Checkout</h1>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <FiAlertTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">There was a problem with your checkout</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <FiMapPin className="text-xl text-amber-600 mr-2" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-gray-700 mb-1">Full Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-gray-700 mb-1">Phone Number*</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>
                
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Street Address*</label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors.street ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your street address"
                  />
                  {formErrors.street && <p className="text-red-500 text-sm mt-1">{formErrors.street}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">City*</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your city"
                  />
                  {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">State*</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors.state ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your state"
                  />
                  {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">PIN Code*</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your PIN code"
                  />
                  {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Notes about your order, e.g. special notes for delivery"
                    rows="3"
                  />
                </div>
              </form>
            </div>

            {/* Payment Method (COD + Stripe) */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <FiCreditCard className="text-xl text-amber-600 mr-2" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mr-3"
                  />
                  <BsCashCoin className="text-xl mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mr-3"
                  />
                  <BsCreditCard2Front className="text-xl mr-3 text-blue-600" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-500">Pay securely with your card via Stripe</p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <FiTruck className="text-xl text-amber-600 mr-2" />
                <h2 className="text-xl font-semibold">Shipping Method</h2>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="mr-3"
                  />
                  <FiPackage className="text-xl mr-3 text-amber-600" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">Standard Shipping</p>
                      <p className="font-medium">₹50</p>
                    </div>
                    <p className="text-sm text-gray-500">Delivery in 5-7 business days</p>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="mr-3"
                  />
                  <FiTruck className="text-xl mr-3 text-green-600" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">Express Shipping</p>
                      <p className="font-medium">₹150</p>
                    </div>
                    <p className="text-sm text-gray-500">Delivery in 1-3 business days</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <span className="text-sm text-gray-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              {items.map((item, idx) => (
                <div key={item.product?._id || item.productId || idx} className="flex py-2">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 mr-4">
                    <img 
                      src={item.product?.images?.[0] || item.image || '/tribal-icon.svg'} 
                      alt={item.product?.name || item.productName || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product?.name || item.productName || 'Product'}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-amber-600">₹{item.product?.price ?? item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center">
                <span>Subtotal:</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping:</span>
                <span>₹{shippingCost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax (18% GST):</span>
                <span>₹{taxAmount.toFixed(0)}</span>
              </div>
              {shippingMethod === 'express' && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Express Delivery:</span>
                  <span>+₹100</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span className="text-amber-600">₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <FiInfo className="text-amber-600 mr-2 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-700">
                    Your order will be delivered by <span className="font-medium">{deliveryDate}</span>
                  </p>
                  {shippingMethod === 'express' && (
                    <p className="text-sm text-green-600 mt-1">
                      Express delivery selected!
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Place Order Button */}
            <div className="mt-6">
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition duration-300"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
