import promisePool from '../utils/database.js';

/**
 * Get all diary entries for a user
 * @param {number} userId - User ID
 * @returns {Array} Array of diary entries
 */
const getAllEntries = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM diaryentries WHERE user_id = ? ORDER BY entry_date DESC',
      [userId]
    );
    
    // Map entry_id to id for frontend compatibility
    return rows.map(entry => ({
      id: entry.entry_id,  // Map entry_id to id for frontend
      entry_id: entry.entry_id, // Keep original for reference
      user_id: entry.user_id,
      entry_date: entry.entry_date,
      mood: entry.mood,
      weight: entry.weight,
      sleep_hours: entry.sleep_hours,
      notes: entry.notes,
      created_at: entry.created_at
    }));
  } catch (error) {
    console.error('Error in getAllEntries:', error);
    throw new Error('Database error');
  }
};

/**
 * Get a single diary entry
 * @param {number} entryId - Entry ID
 * @param {number} userId - User ID (for verification)
 * @returns {object} Diary entry
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
    
    // Map entry_id to id for frontend compatibility
    const entry = rows[0];
    return {
      id: entry.entry_id,  // Map entry_id to id for frontend
      entry_id: entry.entry_id, // Keep original for reference
      user_id: entry.user_id,
      entry_date: entry.entry_date,
      mood: entry.mood,
      weight: entry.weight,
      sleep_hours: entry.sleep_hours,
      notes: entry.notes,
      created_at: entry.created_at
    };
  } catch (error) {
    console.error('Error in getEntryById:', error);
    throw new Error('Database error');
  }
};

/**
 * Create a new diary entry
 * @param {object} entry - Diary entry object
 * @returns {number} Inserted entry ID
 */
const createEntry = async (entry) => {
  try {
    const [result] = await promisePool.query(
      'INSERT INTO diaryentries (user_id, entry_date, mood, weight, sleep_hours, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [entry.user_id, entry.entry_date, entry.mood, entry.weight, entry.sleep_hours, entry.notes]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error in createEntry:', error);
    throw new Error('Database error');
  }
};

/**
 * Update a diary entry
 * @param {number} entryId - Entry ID
 * @param {object} entry - Updated entry data
 * @param {number} userId - User ID (for verification)
 * @returns {boolean} Success indicator
 */
const updateEntry = async (entryId, entry, userId) => {
  try {
    console.log(`Updating entry ${entryId} for user ${userId} with data:`, entry);
    
    const [result] = await promisePool.query(
      'UPDATE diaryentries SET entry_date = ?, mood = ?, weight = ?, sleep_hours = ?, notes = ? WHERE entry_id = ? AND user_id = ?',
      [entry.entry_date, entry.mood, entry.weight, entry.sleep_hours, entry.notes, entryId, userId]
    );
    
    console.log('Update result:', result);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in updateEntry:', error);
    throw new Error('Database error');
  }
};

/**
 * Delete a diary entry
 * @param {number} entryId - Entry ID
 * @param {number} userId - User ID (for verification)
 * @returns {boolean} Success indicator
 */
const deleteEntry = async (entryId, userId) => {
  try {
    console.log(`Deleting entry ${entryId} for user ${userId}`);
    
    const [result] = await promisePool.query(
      'DELETE FROM diaryentries WHERE entry_id = ? AND user_id = ?',
      [entryId, userId]
    );
    
    console.log('Delete result:', result);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in deleteEntry:', error);
    throw new Error('Database error');
  }
};

export { getAllEntries, getEntryById, createEntry, updateEntry, deleteEntry };