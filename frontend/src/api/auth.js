import api from './axios';

// Authentication API functions
const authAPI = {
  // Login user
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Register user
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // Get current user profile
  getCurrentUser: () => {
    return api.get('/users/me');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return api.put('/users/profile', profileData);
  },

  // Change password
  changePassword: (passwordData) => {
    return api.put('/users/password', passwordData);
  },
  
  // Forgot password - request reset
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },
  
  // Reset password with token
  resetPassword: (token, password) => {
    return api.post(`/auth/reset-password/${token}`, { password });
  }
};

export default authAPI;