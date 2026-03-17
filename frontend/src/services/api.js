import axios from 'axios';

// Clean API base URL - no emoji, no special characters
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://intellilearn-y9os.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for AI endpoints
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors with better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Create a user-friendly error message
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Something went wrong. Please try again.';
    
    // Show error to user (can be caught by UI components)
    console.error('API Error:', errorMessage);
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      originalError: error
    });
  }
);

export default api;
