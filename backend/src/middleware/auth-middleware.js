import jwt from 'jsonwebtoken';
import { getUserById } from '../models/user-model.js';

/**
 * Protect routes - Middleware to verify JWT token
 */
const protect = async (req, res, next) => {
  let token;
  
  console.log('Auth middleware running');
  console.log('Headers:', req.headers);

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token.substring(0, 10) + '...');
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      
      // Get user from database - make sure to use the correct ID field
      const user = await getUserById(decoded.id);
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        console.error('User not found in database for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found or token is invalid'
        });
      }
      
      // Set user in request
      req.user = user;
      console.log('User set in request:', user.username);
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token verification failed',
        error: error.message
      });
    }
  } else {
    console.error('No token provided in headers');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

export { protect };