import express from 'express';
import { register, login, getMe } from '../controllers/auth-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

// Käyttäjän rekisteröinti
router.post('/register', register);

// Käyttäjän kirjautuminen
router.post('/login', login);

// Nykyisen käyttäjän tiedot ja hakeminen
router.get('/me', protect, getMe);

export default router;