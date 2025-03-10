import { getAllEntries, getEntryById, createEntry, updateEntry, deleteEntry } from '../models/diary-model.js';

/**
 * Hae kaikki päiväkirjamerkinnät kirjautuneelle käyttäjälle
 * @route GET /api/diary
 * @access Yksityinen
 */
const getDiaryEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const entries = await getAllEntries(userId);
    
    res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Päiväkirjamerkintöjen hakeminen epäonnistui',
      error: error.message
    });
  }
};

/**
 * Hae yksittäinen päiväkirjamerkintä
 * @route GET /api/diary/:id
 * @access Yksityinen
 */
const getDiaryEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;
    
    const entry = await getEntryById(entryId, userId);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Päiväkirjamerkintää ei löytynyt'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Päiväkirjamerkinnän hakeminen epäonnistui',
      error: error.message
    });
  }
};

/**
 * Luo uusi päiväkirjamerkintä
 * @route POST /api/diary
 * @access Yksityinen
 */
const createDiaryEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { entry_date, mood, weight, sleep_hours, notes } = req.body;
    
    // Validoi syöte
    if (!entry_date) {
      return res.status(400).json({
        success: false,
        message: 'Päivämäärä vaaditaan'
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
    const createdEntry = await getEntryById(entryId, userId);

    res.status(201).json({
      success: true,
      data: createdEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Päiväkirjamerkinnän luonti epäonnistui',
      error: error.message
    });
  }
};

/**
 * Päivitä päiväkirjamerkintä
 * @route PUT /api/diary/:id
 * @access Yksityinen
 */
const updateDiaryEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;
    const { entry_date, mood, weight, sleep_hours, notes } = req.body;
    
    // Tarkista onko merkintä olemassa
    const entry = await getEntryById(entryId, userId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Päiväkirjamerkintää ei löytynyt tai sitä ei omista nykyinen käyttäjä'
      });
    }

    // Validoi syöte
    if (!entry_date) {
      return res.status(400).json({
        success: false,
        message: 'Päivämäärä vaaditaan'
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
        message: 'Merkinnän päivitys epäonnistui'
      });
    }
    
    const updatedEntry = await getEntryById(entryId, userId);

    res.json({
      success: true,
      data: updatedEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Päiväkirjamerkinnän päivitys epäonnistui',
      error: error.message
    });
  }
};

/**
 * Poista päiväkirjamerkintä
 * @route DELETE /api/diary/:id
 * @access Yksityinen
 */
const deleteDiaryEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;
    
    // Tarkista onko merkintä olemassa
    const entry = await getEntryById(entryId, userId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Päiväkirjamerkintää ei löytynyt tai sitä ei omista nykyinen käyttäjä'
      });
    }

    const success = await deleteEntry(entryId, userId);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Merkinnän poisto epäonnistui'
      });
    }
    
    res.json({
      success: true,
      message: 'Päiväkirjamerkintä poistettu onnistuneesti'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Päiväkirjamerkinnän poisto epäonnistui',
      error: error.message
    });
  }
};

export { getDiaryEntries, getDiaryEntry, createDiaryEntry, updateDiaryEntry, deleteDiaryEntry };