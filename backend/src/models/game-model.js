import promisePool from '../utils/database.js';

/**
 * Tallenna pelitulos tietokantaan
 * @param {object} scoreData - Pelitietojen objekti
 * @returns {number} Lisätyn tuloksen ID
 */
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

/**
 * Hae tuloslista tietylle pelityypille
 * @param {string} gameType - Pelityyppi
 * @param {number} limit - Tulosten maksimimäärä
 * @returns {Array} Tuloslista-tietue
 */
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

/**
 * Hae käyttäjän tulokset tietylle pelityypille
 * @param {number} userId - Käyttäjän ID
 * @param {string} gameType - Pelityyppi
 * @param {number} limit - Tulosten maksimimäärä
 * @returns {Array} Käyttäjän tulokset
 */
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

/**
 * Hae käyttäjän paras tulos tietylle pelityypille
 * @param {number} userId - Käyttäjän ID
 * @param {string} gameType - Pelityyppi
 * @returns {number} Paras tulos tai 0 jos tuloksia ei löydy
 */
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