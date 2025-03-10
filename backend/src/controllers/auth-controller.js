import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getUserById, getUserByUsername, registerUser as registerUserModel } from '../models/user-model.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email and password are required'
      });
    }

    // Register user - this step is working correctly
    const userId = await registerUserModel({ username, email, password });
    console.log(`User registered with ID: ${userId}`);

    try {
      // Get user without password
      const user = await getUserById(userId);
      
      if (!user) {
        console.error(`User with ID ${userId} was created but could not be retrieved`);
        return res.status(500).json({
          success: false,
          message: 'User was registered but could not be retrieved'
        });
      }

      // Check if JWT_SECRET is defined
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error (JWT_SECRET missing)'
        });
      }

      // Generate token
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          token
        }
      });
    } catch (innerError) {
      // User was created but we had a problem with the response
      console.error('Error after successful registration:', innerError);
      
      // Return partial success - telling the client the account was created
      // but there was an issue generating the session
      return res.status(201).json({
        success: true,
        partialSuccess: true,
        message: 'Account created successfully, Please log in.',
        data: {
          id: userId,
          username: username,
          email: email
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'Username already exists' || error.message === 'Email already exists') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check if user exists
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Log what we're using for the user ID
    console.log('Creating token with user ID:', user.id || user.user_id);

    // Generate token using the correct ID field (could be user.id or user.user_id)
    const token = jwt.sign({ id: user.id || user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      success: true,
      data: {
        id: user.id || user.user_id,
        username: user.username,
        email: user.email,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    // User is already available from auth middleware
    const user = req.user;
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: error.message
    });
  }
};

export { register, login, getMe };