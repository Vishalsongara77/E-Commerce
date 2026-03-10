import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-api-hazel-six.vercel.app';

let csrfToken = null;

export const getCsrfToken = async () => {
  if (!csrfToken) {
    try {
      const response = await axios.get(`${API_URL}/auth/csrf-token`);
      csrfToken = response.data.csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  return csrfToken;
};

export const makeSecureRequest = async (method, url, data = null, headers = {}) => {
  const token = await getCsrfToken();
  const config = {
    method,
    url,
    headers: {
      ...headers,
      'X-CSRF-Token': token
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};
