/**
 * Axios Configuration with JWT Interceptor
 * Automatically adds Authorization header to all requests
 * Handles 401/403 errors globally
 */

import axios from 'axios';
import { getToken, clearToken, isAuthenticated } from './tokenStorage';

// Get API URL from environment variable or default to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor
 * Adds JWT token to Authorization header
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = getToken();
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Authorization header added to request:', config.url);
    } else {
      console.log('⚠️ No token found, sending request without Authorization header');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles 401/403 errors globally
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Success response, return as is
    return response;
  },
  (error) => {
    // Handle error responses
    if (error.response) {
      const { status, data } = error.response;
      
      // 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        console.error('🚫 401 Unauthorized:', data.message || 'Authentication required');
        
        // Clear token and redirect to login
        clearToken();
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }
      }
      
      // 403 Forbidden - Insufficient permissions
      if (status === 403) {
        console.error('🚫 403 Forbidden:', data.message || 'Insufficient permissions');
        
        // Show error notification (you can replace this with your toast/notification library)
        alert('Access Denied: You don\'t have permission to perform this action.');
      }
      
      // 500 Internal Server Error
      if (status === 500) {
        console.error('💥 500 Internal Server Error:', data.message || 'Server error');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('📡 No response received:', error.request);
      console.error('❌ Network error or server is down');
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to make authenticated GET request
 */
export const get = (url, config = {}) => {
  return axiosInstance.get(url, config);
};

/**
 * Helper function to make authenticated POST request
 */
export const post = (url, data, config = {}) => {
  return axiosInstance.post(url, data, config);
};

/**
 * Helper function to make authenticated PUT request
 */
export const put = (url, data, config = {}) => {
  return axiosInstance.put(url, data, config);
};

/**
 * Helper function to make authenticated PATCH request
 */
export const patch = (url, data, config = {}) => {
  return axiosInstance.patch(url, data, config);
};

/**
 * Helper function to make authenticated DELETE request
 */
export const del = (url, config = {}) => {
  return axiosInstance.delete(url, config);
};

/**
 * Helper function to make request without auth (for public endpoints)
 */
export const publicRequest = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
export { API_URL };

