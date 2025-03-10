import { getAllEntries, getEntryById, createEntry, updateEntry, deleteEntry } from '../models/diary-model.js';

/**
 * Get all diary entries for the logged-in user
 * @route GET /api/diary
 * @access Private
 */
const getDiaryEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Getting diary entries for user ID:', userId);
    
    const entries = await getAllEntries(userId);
    
    console.log(`Found ${entries.length} diary entries`);
    
    res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    console.error('Get diary entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diary entries',
      error: error.message
    });
  }
};

/**
 * Get a single diary entry
 * @route GET /api/diary/:id
 * @access Private
 */
const getDiaryEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;
    
    console.log(`Getting diary entry ${entryId} for user ${userId}`);
    
    const entry = await getEntryById(entryId, userId);
    
    if (!entry) {
      console.log(`Entry ${entryId} not found for user ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get diary entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diary entry',
      error: error.message
    });
  }
};

/**
 * Create a new diary entry
 * @route POST /api/diary
 * @access Private
 */
const createDiaryEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { entry_date, mood, weight, sleep_hours, notes } = req.body;

    console.log('Creating new diary entry for user:', userId);
    console.log('Entry data:', { entry_date, mood, weight, sleep_hours });
    
    // Validate input
    if (!entry_date) {
      return res.status(400).json({
        success: false,
        message: 'Entry date is required'
      });
    }

    const newEntry = {
      user_id: userId,
      entry_date,
      mood,
      weight,
      sleep_hours,
      notes
    };

    const entryId = await createEntry(newEntry);
    console.log('Created diary entry with ID:', entryId);
    
    const createdEntry = await getEntryById(entryId, userId);

    res.status(201).json({
      success: true,
      data: createdEntry
    });
  } catch (error) {
    console.error('Create diary entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create diary entry',
      error: error.message
    });
  }
};

/**
 * Update a diary entry
 * @route PUT /api/diary/:id
 * @access Private
 */
const updateDiaryEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;
    const { entry_date, mood, weight, sleep_hours, notes } = req.body;

    console.log(`Updating diary entry ${entryId} for user ${userId}`);
    console.log('New data:', { entry_date, mood, weight, sleep_hours });
    
    // Check if entry exists
    const entry = await getEntryById(entryId, userId);
    if (!entry) {
      console.log(`Entry ${entryId} not found for user ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found or not owned by you'
      });
    }

    // Validate input
    if (!entry_date) {
      return res.status(400).json({
        success: false,
        message: 'Entry date is required'
      });
    }

    const updatedData = {
      entry_date,
      mood,
      weight,
      sleep_hours,
      notes
    };

    const success = await updateEntry(entryId, updatedData, userId);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update entry'
      });
    }
    
    const updatedEntry = await getEntryById(entryId, userId);

    res.json({
      success: true,
      data: updatedEntry
    });
  } catch (error) {
    console.error('Update diary entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diary entry',
      error: error.message
    });
  }
};

/**
 * Delete a diary entry
 * @route DELETE /api/diary/:id
 * @access Private
 */
const deleteDiaryEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;

    console.log(`Attempting to delete entry ${entryId} for user ${userId}`);
    
    // Check if entry exists
    const entry = await getEntryById(entryId, userId);
    if (!entry) {
      console.log(`Entry ${entryId} not found for user ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found or not owned by you'
      });
    }

    const success = await deleteEntry(entryId, userId);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete entry'
      });
    }

    console.log(`Successfully deleted entry ${entryId} for user ${userId}`);
    
    res.json({
      success: true,
      message: 'Diary entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete diary entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete diary entry',
      error: error.message
    });
  }
};

export { getDiaryEntries, getDiaryEntry, createDiaryEntry, updateDiaryEntry, deleteDiaryEntry };