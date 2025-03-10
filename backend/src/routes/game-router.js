import express from 'express';
import { getLeaderboard, saveScore, getUserScores, getHighScore, apiRoot } from '../controllers/game-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

// Root game API endpoint
router.get('/', apiRoot);

// Public reitti päästääkseen leaderboardiin
router.get('/leaderboard', getLeaderboard);

// suojatut reitit - vaativat autentikaation
router.post('/scores', protect, saveScore);
router.get('/user-scores', protect, getUserScores);
router.get('/high-score', protect, getHighScore);

export default router;