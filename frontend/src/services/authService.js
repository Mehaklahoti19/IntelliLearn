import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please check your credentials.'
      };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get user information.'
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
