import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getUserById, getUserByUsername, registerUser as registerUserModel } from '../models/user-model.js';

/**
 * Rekisteröi uuden käyttäjän
 * @route POST /api/auth/register
 * @access Julkinen
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Tarkista syöte
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Käyttäjänimi, sähköposti ja salasana vaaditaan'
      });
    }

    // Rekisteröi käyttäjä
    const userId = await registerUserModel({ username, email, password });

    try {
      // Hae käyttäjä ilman salasanaa
      const user = await getUserById(userId);
      
      if (!user) {
        return res.status(500).json({
          success: false,
          message: 'Käyttäjä rekisteröitiin mutta tietoja ei voitu hakea'
        });
      }

      // Tarkista onko JWT_SECRET määritelty
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message: 'Palvelimen määritysvirhe (JWT_SECRET puuttuu)'
        });
      }

      // Luo token
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
      // Osittainen onnistuminen - tili luotiin mutta sessio-ongelmia
      return res.status(201).json({
        success: true,
        partialSuccess: true,
        message: 'Tili luotu onnistuneesti. Kirjaudu sisään.',
        data: {
          id: userId,
          username: username,
          email: email
        }
      });
    }
  } catch (error) {
    if (error.message === 'Username already exists' || error.message === 'Email already exists') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Rekisteröinti epäonnistui',
      error: error.message
    });
  }
};

/**
 * Kirjaa käyttäjän sisään
 * @route POST /api/auth/login
 * @access Julkinen
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tarkista syöte
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Käyttäjänimi ja salasana vaaditaan'
      });
    }

    // Tarkista onko käyttäjä olemassa
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Virheelliset kirjautumistiedot'
      });
    }

    // Tarkista täsmääkö salasana
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Virheelliset kirjautumistiedot'
      });
    }

    // Tarkista onko JWT_SECRET määritelty
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Palvelimen määritysvirhe'
      });
    }

    // Luo token käyttäen oikeaa ID-kenttää
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
    res.status(500).json({
      success: false,
      message: 'Kirjautuminen epäonnistui',
      error: error.message
    });
  }
};

/**
 * Hae nykyinen käyttäjä
 * @route GET /api/auth/me
 * @access Yksityinen
 */
const getMe = async (req, res) => {
  try {
    // Käyttäjä on jo saatavilla auth middlewaresta
    const user = req.user;
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Käyttäjätietojen haku epäonnistui',
      error: error.message
    });
  }
};

export { register, login, getMe };