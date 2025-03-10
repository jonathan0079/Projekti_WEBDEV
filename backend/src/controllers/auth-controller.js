import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getUserById, getUserByUsername, registerUser as registerUserModel } from '../models/user-model.js';

// Käyttäjän rekisteröinti
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validointi - tarkistetaan, että käyttäjätunnus, sähköposti ja salasana on annettu
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email and password are required'
      });
    }

    const userId = await registerUserModel({ username, email, password });
    console.log(`User registered with ID: ${userId}`);

    try {
      // Get user by ID
      const user = await getUserById(userId);
      
      if (!user) {
        console.error(`User with ID ${userId} was created but could not be retrieved`);
        return res.status(500).json({
          success: false,
          message: 'User was registered but could not be retrieved'
        });
      }

      // tarkistaa onko JWT_SECRET ympäristömuuttujassa
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error (JWT_SECRET missing)'
        });
      }

      // Generoi tokenin
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
      console.error('Error after successful registration:', innerError);
      
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

// Käyttäjän kirjautuminen

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validaatio - tarkistetaan, että käyttäjätunnus ja salasana on annettu
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Tarkistaa jos käyttäjä on olemassa
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // tarkistaa onko salasana oikein
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // tarkistaa onko JWT_SECRET ympäristömuuttujassa
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Logaa käyttäjän ID
    console.log('Creating token with user ID:', user.id || user.user_id);

    // generoi tokenin ja palauttaa sen käyttäjälle
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

// Hakee nykyisen käyttäjän tiedot

const getMe = async (req, res) => {
  try {
    // Käytttäjä on jo autentikoitu, joten vain palautetaan käyttäjän tiedot
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