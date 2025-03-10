import promisePool from '../utils/database.js';

/**
 * Hae kaikki päiväkirjamerkinnät käyttäjälle
 * @param {number} userId - Käyttäjän ID
 * @returns {Array} Taulukko päiväkirjamerkintöjä
 */
const getAllEntries = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM diaryentries WHERE user_id = ? ORDER BY entry_date DESC',
      [userId]
    );
    
    // Aseta entry_id kenttä id:ksi frontend-yhteensopivuuden vuoksi
    return rows.map(entry => ({
      id: entry.entry_id,
      entry_id: entry.entry_id,
      user_id: entry.user_id,
      entry_date: entry.entry_date,
      mood: entry.mood,
      weight: entry.weight,
      sleep_hours: entry.sleep_hours,
      notes: entry.notes,
      created_at: entry.created_at
    }));
  } catch (error) {
    throw new Error('Tietokantavirhe');
  }
};

/**
 * Hae yksittäinen päiväkirjamerkintä
 * @param {number} entryId - Merkinnän ID
 * @param {number} userId - Käyttäjän ID (varmistusta varten)
 * @returns {object} Päiväkirjamerkintä
 */
const getEntryById = async (entryId, userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM diaryentries WHERE entry_id = ? AND user_id = ?',
      [entryId, userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    // Aseta entry_id kenttä id:ksi frontend-yhteensopivuuden vuoksi
    const entry = rows[0];
    return {
      id: entry.entry_id,
      entry_id: entry.entry_id,
      user_id: entry.user_id,
      entry_date: entry.entry_date,
      mood: entry.mood,
      weight: entry.weight,
      sleep_hours: entry.sleep_hours,
      notes: entry.notes,
      created_at: entry.created_at
    };
  } catch (error) {
    throw new Error('Tietokantavirhe');
  }
};

/**
 * Luo uusi päiväkirjamerkintä
 * @param {object} entry - Päiväkirjamerkintä-objekti
 * @returns {number} Lisätyn merkinnän ID
 */
const createEntry = async (entry) => {
  try {
    const [result] = await promisePool.query(
      'INSERT INTO diaryentries (user_id, entry_date, mood, weight, sleep_hours, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [entry.user_id, entry.entry_date, entry.mood, entry.weight, entry.sleep_hours, entry.notes]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Tietokantavirhe');
  }
};

/**
 * Päivitä päiväkirjamerkintä
 * @param {number} entryId - Merkinnän ID
 * @param {object} entry - Päivitetty merkintädata
 * @param {number} userId - Käyttäjän ID (varmistusta varten)
 * @returns {boolean} Onnistumisen ilmaisin
 */
const updateEntry = async (entryId, entry, userId) => {
  try {
    const [result] = await promisePool.query(
      'UPDATE diaryentries SET entry_date = ?, mood = ?, weight = ?, sleep_hours = ?, notes = ? WHERE entry_id = ? AND user_id = ?',
      [entry.entry_date, entry.mood, entry.weight, entry.sleep_hours, entry.notes, entryId, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Tietokantavirhe');
  }
};

/**
 * Poista päiväkirjamerkintä
 * @param {number} entryId - Merkinnän ID
 * @param {number} userId - Käyttäjän ID (varmistusta varten)
 * @returns {boolean} Onnistumisen ilmaisin
 */
const deleteEntry = async (entryId, userId) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM diaryentries WHERE entry_id = ? AND user_id = ?',
      [entryId, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Tietokantavirhe');
  }
};

export { getAllEntries, getEntryById, createEntry, updateEntry, deleteEntry };