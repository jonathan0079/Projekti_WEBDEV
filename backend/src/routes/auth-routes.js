import express from 'express';
import { register, login, getMe } from '../controllers/auth-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user
router.get('/me', protect, getMe);

export default router;