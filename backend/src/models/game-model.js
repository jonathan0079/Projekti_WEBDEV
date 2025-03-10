import promisePool from '../utils/database.js';

// Tallentaa pelituloksen tietokantaan

const saveGameScore = async (scoreData) => {
  try {
    const [result] = await promisePool.query(
      'INSERT INTO GameScores (user_id, score, game_type) VALUES (?, ?, ?)',
      [scoreData.user_id, scoreData.score, scoreData.game_type]
    );
    return result.insertId;
  } catch (error) {
    throw new Error(`Tietokantavirhe tuloksen tallennuksessa: ${error.message}`);
  }
};

// Hakee pelin tulokset tietokannasta

const getGameLeaderboard = async (gameType, limit = 10) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT gs.id, gs.score, gs.game_type, gs.created_at, u.username 
       FROM GameScores gs
       JOIN users u ON gs.user_id = u.user_id
       WHERE gs.game_type = ?
       ORDER BY gs.score DESC
       LIMIT ?`,
      [gameType, limit]
    );
    return rows;
  } catch (error) {
    throw new Error(`Tietokantavirhe tuloslistan hakemisessa: ${error.message}`);
  }
};

// Hakee käyttäjän pelitulokset tietokannasta

const getGameScoresByUser = async (userId, gameType, limit = 5) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT gs.id, gs.score, gs.game_type, gs.created_at
       FROM GameScores gs
       WHERE gs.user_id = ? AND gs.game_type = ?
       ORDER BY gs.score DESC
       LIMIT ?`,
      [userId, gameType, limit]
    );
    return rows;
  } catch (error) {
    throw new Error(`Tietokantavirhe käyttäjän tulosten hakemisessa: ${error.message}`);
  }
};

// Hakee käyttäjän parhaan tuloksen tietokannasta

const getUserHighScore = async (userId, gameType) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT MAX(score) as high_score
       FROM GameScores
       WHERE user_id = ? AND game_type = ?`,
      [userId, gameType]
    );
    return rows[0]?.high_score || 0;
  } catch (error) {
    throw new Error(`Tietokantavirhe parhaan tuloksen hakemisessa: ${error.message}`);
  }
};

export { saveGameScore, getGameLeaderboard, getGameScoresByUser, getUserHighScore };