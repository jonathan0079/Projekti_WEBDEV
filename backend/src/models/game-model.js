import promisePool from '../utils/database.js';

/**
 * Save a game score to the database
 * @param {object} scoreData - Game score data
 * @returns {number} Inserted score ID
 */
const saveGameScore = async (scoreData) => {
  try {
    console.log('Saving game score:', scoreData);
    
    // Try lowercase table name first (most common in development)
    try {
      const [result] = await promisePool.query(
        'INSERT INTO gamescores (user_id, score, game_type) VALUES (?, ?, ?)',
        [scoreData.user_id, scoreData.score, scoreData.game_type]
      );
      
      console.log('Score saved with ID:', result.insertId);
      return result.insertId;
    } catch (lowercaseError) {
      console.log('Error with lowercase table name, trying camelCase:', lowercaseError.message);
      
      // Try camelCase table name as fallback
      const [result] = await promisePool.query(
        'INSERT INTO GameScores (user_id, score, game_type) VALUES (?, ?, ?)',
        [scoreData.user_id, scoreData.score, scoreData.game_type]
      );
      
      console.log('Score saved with ID (camelCase table):', result.insertId);
      return result.insertId;
    }
  } catch (error) {
    console.error('Error in saveGameScore:', error);
    throw new Error(`Database error when saving score: ${error.message}`);
  }
};

/**
 * Get leaderboard for a specific game type
 * @param {string} gameType - Type of game
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} Array of leaderboard entries
 */
const getGameLeaderboard = async (gameType, limit = 10) => {
  try {
    console.log(`Getting leaderboard for game: ${gameType}, limit: ${limit}`);
    
    // Try to query with lowercase table name first
    try {
      const [rows] = await promisePool.query(
        `SELECT gs.id, gs.score, gs.game_type, gs.created_at, u.username 
         FROM gamescores gs
         JOIN users u ON gs.user_id = u.id
         WHERE gs.game_type = ?
         ORDER BY gs.score DESC
         LIMIT ?`,
        [gameType, limit]
      );
      
      console.log(`Found ${rows.length} leaderboard entries`);
      return rows;
    } catch (lowercaseError) {
      console.log('Error with lowercase table and join, trying alternative schema:', lowercaseError.message);
      
      // Try with camelCase table name and different join condition
      try {
        const [rows] = await promisePool.query(
          `SELECT gs.id, gs.score, gs.game_type, gs.created_at, u.username 
           FROM GameScores gs
           JOIN users u ON gs.user_id = u.id
           WHERE gs.game_type = ?
           ORDER BY gs.score DESC
           LIMIT ?`,
          [gameType, limit]
        );
        
        console.log(`Found ${rows.length} leaderboard entries with camelCase table`);
        return rows;
      } catch (camelCaseError) {
        console.log('Error with camelCase table, trying with user_id field:', camelCaseError.message);
        
        // Final attempt with user_id field instead of id
        const [rows] = await promisePool.query(
          `SELECT gs.id, gs.score, gs.game_type, gs.created_at, u.username 
           FROM gamescores gs
           JOIN users u ON gs.user_id = u.user_id
           WHERE gs.game_type = ?
           ORDER BY gs.score DESC
           LIMIT ?`,
          [gameType, limit]
        );
        
        console.log(`Found ${rows.length} leaderboard entries with user_id join`);
        return rows;
      }
    }
  } catch (error) {
    console.error('Error in getGameLeaderboard:', error);
    throw new Error(`Database error when retrieving leaderboard: ${error.message}`);
  }
};

/**
 * Get user's scores for a specific game type
 * @param {number} userId - User ID
 * @param {string} gameType - Type of game
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} Array of score entries
 */
const getGameScoresByUser = async (userId, gameType, limit = 5) => {
  try {
    console.log(`Getting scores for user: ${userId}, game: ${gameType}, limit: ${limit}`);
    
    // Try to query with lowercase table name first
    try {
      const [rows] = await promisePool.query(
        `SELECT gs.id, gs.score, gs.game_type, gs.created_at
         FROM gamescores gs
         WHERE gs.user_id = ? AND gs.game_type = ?
         ORDER BY gs.score DESC
         LIMIT ?`,
        [userId, gameType, limit]
      );
      
      console.log(`Found ${rows.length} scores for user`);
      return rows;
    } catch (lowercaseError) {
      console.log('Error with lowercase table, trying camelCase:', lowercaseError.message);
      
      // Try with camelCase table name
      const [rows] = await promisePool.query(
        `SELECT gs.id, gs.score, gs.game_type, gs.created_at
         FROM GameScores gs
         WHERE gs.user_id = ? AND gs.game_type = ?
         ORDER BY gs.score DESC
         LIMIT ?`,
        [userId, gameType, limit]
      );
      
      console.log(`Found ${rows.length} scores for user with camelCase table`);
      return rows;
    }
  } catch (error) {
    console.error('Error in getGameScoresByUser:', error);
    throw new Error(`Database error when retrieving user scores: ${error.message}`);
  }
};

/**
 * Get user's highest score for a specific game type
 * @param {number} userId - User ID
 * @param {string} gameType - Type of game
 * @returns {number} Highest score or 0 if no scores found
 */
const getUserHighScore = async (userId, gameType) => {
  try {
    console.log(`Getting high score for user: ${userId}, game: ${gameType}`);
    
    // Try to query with lowercase table name first
    try {
      const [rows] = await promisePool.query(
        `SELECT MAX(score) as high_score
         FROM gamescores
         WHERE user_id = ? AND game_type = ?`,
        [userId, gameType]
      );
      
      const highScore = rows[0]?.high_score || 0;
      console.log(`High score: ${highScore}`);
      return highScore;
    } catch (lowercaseError) {
      console.log('Error with lowercase table, trying camelCase:', lowercaseError.message);
      
      // Try with camelCase table name
      const [rows] = await promisePool.query(
        `SELECT MAX(score) as high_score
         FROM GameScores
         WHERE user_id = ? AND game_type = ?`,
        [userId, gameType]
      );
      
      const highScore = rows[0]?.high_score || 0;
      console.log(`High score (camelCase table): ${highScore}`);
      return highScore;
    }
  } catch (error) {
    console.error('Error in getUserHighScore:', error);
    throw new Error(`Database error when retrieving high score: ${error.message}`);
  }
};

/**
 * Test database connection and verify the GameScores table exists
 */
const testGameDatabase = async () => {
  try {
    console.log('Testing game database connection...');
    
    // Test database connection
    const [connectionResult] = await promisePool.query('SELECT 1 as test');
    console.log('Database connection test:', connectionResult);
    
    // Check if the table exists with either name variation
    const [tables] = await promisePool.query("SHOW TABLES LIKE 'game%'");
    
    if (tables.length === 0) {
      console.error('No game scores table found!');
      return false;
    }
    
    // Log all tables that match the pattern
    console.log('Found game tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });
    
    // Check which table to use
    const useTable = tables.some(t => Object.values(t)[0].toLowerCase() === 'gamescores') 
      ? 'gamescores' 
      : 'GameScores';
    
    console.log(`✅ Will use table name: ${useTable}`);
    
    return true;
  } catch (error) {
    console.error('Error testing game database:', error);
    return false;
  }
};

// Test the database connection when the module is loaded
testGameDatabase().then(success => {
  if (success) {
    console.log('✅ Game database is properly set up');
  } else {
    console.error('❌ Game database setup issue detected');
  }
}).catch(err => {
  console.error('Database check failed, but continuing server startup:', err.message);
});

export { saveGameScore, getGameLeaderboard, getGameScoresByUser, getUserHighScore };