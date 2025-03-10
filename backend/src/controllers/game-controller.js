import { saveGameScore, getGameLeaderboard, getGameScoresByUser, getUserHighScore } from '../models/game-model.js';

/**
 * Hae tulostaulun tiedot
 * @route GET /api/game/leaderboard
 * @access Julkinen
 */
const getLeaderboard = async (req, res) => {
  try {
    const gameType = req.query.game_type || 'calorie_clicker';
    const limit = parseInt(req.query.limit) || 10;
    
    const leaderboard = await getGameLeaderboard(gameType, limit);
    
    res.json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tulostaulun hakeminen epäonnistui',
      error: error.message
    });
  }
};

/**
 * Tallenna pelitulos
 * @route POST /api/game/scores
 * @access Yksityinen
 */
const saveScore = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Käyttäjän ID:tä ei löytynyt pyynnöstä'
      });
    }
    
    const { score, game_type } = req.body;
    
    // Validoi syöte
    if (score === undefined || !game_type) {
      return res.status(400).json({
        success: false,
        message: 'Tulos ja pelityyppi vaaditaan'
      });
    }
    
    // Validoi että tulos on numero
    const parsedScore = parseInt(score);
    if (isNaN(parsedScore)) {
      return res.status(400).json({
        success: false,
        message: 'Tuloksen täytyy olla numero'
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
      message: 'Tulos tallennettu onnistuneesti',
      data: {
        id: scoreId,
        ...scoreData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tuloksen tallentaminen epäonnistui',
      error: error.message
    });
  }
};

/**
 * Hae käyttäjän tulokset pelille
 * @route GET /api/game/user-scores
 * @access Yksityinen
 */
const getUserScores = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Käyttäjän ID:tä ei löytynyt pyynnöstä'
      });
    }
    
    const gameType = req.query.game_type || 'calorie_clicker';
    const limit = parseInt(req.query.limit) || 5;
    
    const scores = await getGameScoresByUser(userId, gameType, limit);
    
    res.json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Käyttäjän tuloksien hakeminen epäonnistui',
      error: error.message
    });
  }
};

/**
 * Hae käyttäjän paras tulos pelille
 * @route GET /api/game/high-score
 * @access Yksityinen
 */
const getHighScore = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Käyttäjän ID:tä ei löytynyt pyynnöstä'
      });
    }
    
    const gameType = req.query.game_type || 'calorie_clicker';
    
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
    res.status(500).json({
      success: false,
      message: 'Parhaan tuloksen hakeminen epäonnistui',
      error: error.message
    });
  }
};

/**
 * API:n juuripäätepisteen testi
 * @route GET /api/game
 * @access Julkinen
 */
const apiRoot = (req, res) => {
  res.json({ 
    message: 'Tervetuloa Peli-API:in',
    endpoints: {
      leaderboard: '/api/game/leaderboard?game_type=calorie_clicker&limit=10',
      userScores: '/api/game/user-scores?game_type=calorie_clicker&limit=5 (vaatii kirjautumisen)',
      highScore: '/api/game/high-score?game_type=calorie_clicker (vaatii kirjautumisen)',
      saveScore: '/api/game/scores (POST, vaatii kirjautumisen)'
    }
  });
};

export { getLeaderboard, saveScore, getUserScores, getHighScore, apiRoot };