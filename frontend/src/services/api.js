import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and CSRF protection
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
      try {
        const { getCsrfToken } = await import('../utils/csrf')
        const csrfToken = await getCsrfToken()
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken
        }
      } catch (error) {
        console.warn('Failed to get CSRF token:', error)
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid/expired token; let calling code handle navigation
      localStorage.removeItem('token')
      // Avoid hard redirect to prevent request abort and dev-server errors
      // Components/pages should check auth and navigate appropriately
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  googleLogin: (credential, role) => api.post('/auth/google', { credential, role }),
  contact: (contactData) => api.post('/auth/contact', contactData),
}

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getSellerProducts: (params) => api.get('/products/seller/my-products', { params }),
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
  addProductReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
}

// Payments API
export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  createStripeCheckoutSession: (data) => api.post('/payments/stripe/create-checkout-session', data),
  verifyStripeSession: (data) => api.post('/payments/stripe/verify-session', data),
}

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
}

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getSellerOrders: () => api.get('/orders/seller'),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
}

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post('/users/wishlist/add', { productId }),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/remove/${productId}`),
}

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getProducts: (params) => api.get('/admin/products', { params }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status, note) => api.put(`/admin/orders/${id}/status`, { status, note }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
}

// Quick Actions API
export const quickActionsAPI = {
  getQuickActions: () => api.get('/quick-actions'),
}

// EHR API
export const ehrAPI = {
  createRecord: (recordData) => api.post('/ehr', recordData),
  getPatientRecords: (patientId) => api.get(`/ehr/patient/${patientId}`),
  getDoctorRecords: () => api.get('/ehr/doctor'),
  updateRecord: (id, recordData) => api.put(`/ehr/${id}`, recordData),
  deleteRecord: (id) => api.delete(`/ehr/${id}`),
}

export default api
