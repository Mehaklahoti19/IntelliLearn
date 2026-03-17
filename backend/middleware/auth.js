const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'intellilearn-fallback-secret-key-2024');

      // Get user from token
      req.user = await authService.findUserById(decoded.id);

      if (!req.user) {
        console.log('Auth failed: User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } else {
      console.log('Auth failed: No Bearer token in headers');
      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };
