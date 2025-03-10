import { saveGameScore, getGameLeaderboard, getGameScoresByUser, getUserHighScore } from '../models/game-model.js';

/**
 * Get leaderboard data
 * @route GET /api/game/leaderboard
 * @access Public
 */
const getLeaderboard = async (req, res) => {
  try {
    const gameType = req.query.game_type || 'calorie_clicker';
    const limit = parseInt(req.query.limit) || 10;
    
    console.log(`Leaderboard request for game_type: ${gameType}, limit: ${limit}`);
    
    const leaderboard = await getGameLeaderboard(gameType, limit);
    
    // Return a well-structured response
    res.json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard',
      error: error.message
    });
  }
};

/**
 * Save a game score
 * @route POST /api/game/scores
 * @access Private
 */
const saveScore = async (req, res) => {
  try {
    // The user object from auth middleware might have different field names
    // So we check for both id and user_id
    const userId = req.user.id || req.user.user_id;
    
    if (!userId) {
      console.error('No user ID found in request:', req.user);
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request'
      });
    }
    
    const { score, game_type } = req.body;
    
    console.log(`Saving score: ${score} for game: ${game_type}, user: ${userId}`);
    
    // Validate input
    if (score === undefined || !game_type) {
      return res.status(400).json({
        success: false,
        message: 'Score and game type are required'
      });
    }
    
    // Validate score is a number
    const parsedScore = parseInt(score);
    if (isNaN(parsedScore)) {
      return res.status(400).json({
        success: false,
        message: 'Score must be a number'
      });
    }
    
    const scoreData = {
      user_id: userId,
      score: parsedScore,
      game_type
    };
    
    const scoreId = await saveGameScore(scoreData);
    
    res.status(201).json({
      success: true,
      message: 'Score saved successfully',
      data: {
        id: scoreId,
        ...scoreData
      }
    });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save score',
      error: error.message
    });
  }
};

/**
 * Get user's scores for a game
 * @route GET /api/game/user-scores
 * @access Private
 */
const getUserScores = async (req, res) => {
  try {
    // The user object from auth middleware might have different field names
    // So we check for both id and user_id
    const userId = req.user.id || req.user.user_id;
    
    if (!userId) {
      console.error('No user ID found in request:', req.user);
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request'
      });
    }
    
    const gameType = req.query.game_type || 'calorie_clicker';
    const limit = parseInt(req.query.limit) || 5;
    
    console.log(`User scores request for user: ${userId}, game_type: ${gameType}, limit: ${limit}`);
    
    const scores = await getGameScoresByUser(userId, gameType, limit);
    
    res.json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    console.error('Get user scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user scores',
      error: error.message
    });
  }
};

/**
 * Get user's highest score for a game
 * @route GET /api/game/high-score
 * @access Private
 */
const getHighScore = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request'
      });
    }
    
    const gameType = req.query.game_type || 'calorie_clicker';
    
    console.log(`High score request for user: ${userId}, game_type: ${gameType}`);
    
    const highScore = await getUserHighScore(userId, gameType);
    
    res.json({
      success: true,
      data: {
        user_id: userId,
        game_type: gameType,
        high_score: highScore
      }
    });
  } catch (error) {
    console.error('Get high score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve high score',
      error: error.message
    });
  }
};

/**
 * Root API test endpoint
 * @route GET /api/game
 * @access Public
 */
const apiRoot = (req, res) => {
  res.json({ 
    message: 'Welcome to the Game API',
    endpoints: {
      leaderboard: '/api/game/leaderboard?game_type=calorie_clicker&limit=10',
      userScores: '/api/game/user-scores?game_type=calorie_clicker&limit=5 (requires auth)',
      highScore: '/api/game/high-score?game_type=calorie_clicker (requires auth)',
      saveScore: '/api/game/scores (POST, requires auth)'
    }
  });
};

export { getLeaderboard, saveScore, getUserScores, getHighScore, apiRoot };