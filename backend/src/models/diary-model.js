import promisePool from '../utils/database.js';

//hakee kaikki päiväkirjamerkinnät

const getAllEntries = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM diaryentries WHERE user_id = ? ORDER BY entry_date DESC',
      [userId]
    );
    
  // karttaa entry_id: n id: ksi frontend-yhteensopivuuden vuoksi

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
    console.error('Error in getAllEntries:', error);
    throw new Error('Database error');
  }
};

//hakee päiväkirjamerkinnän id: n perusteella

const getEntryById = async (entryId, userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM diaryentries WHERE entry_id = ? AND user_id = ?',
      [entryId, userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
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
    console.error('Error in getEntryById:', error);
    throw new Error('Database error');
  }
};

// Luo uuden päiväkirjamerkinnän

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

// Päivittää päiväkirjamerkinnän

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

// Poistaa päiväkirjamerkinnän

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