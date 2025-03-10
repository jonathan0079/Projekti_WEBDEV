import jwt from 'jsonwebtoken';
import { getUserById } from '../models/user-model.js';

/**
 * Suojaa reitit - Middleware JWT-tokenin todentamiseen
 */
const protect = async (req, res, next) => {
  let token;

  // Tarkista token headerista
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Hae token headerista
      token = req.headers.authorization.split(' ')[1];
      
      // Todenna token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Hae käyttäjä tietokannasta
      const user = await getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Käyttäjää ei löydy tai token on virheellinen'
        });
      }
      
      // Aseta käyttäjä requestiin
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Ei käyttöoikeutta, token-validointi epäonnistui',
        error: error.message
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Ei käyttöoikeutta, token puuttuu'
    });
  }
};

export { protect };