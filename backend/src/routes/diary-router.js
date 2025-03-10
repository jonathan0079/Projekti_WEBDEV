// Tuodaan Express ja tarvittavat kontrollerit
import express from 'express';
import { 
  getDiaryEntries, 
  getDiaryEntry, 
  createDiaryEntry, 
  updateDiaryEntry, 
  deleteDiaryEntry 
} from '../controllers/diary-controller.js';
import { protect } from '../middleware/auth-middleware.js';

// Luodaan Express-reititin
const router = express.Router();

// Suojataan kaikki päiväkirjareitit - vaaditaan kirjautuminen
router.use(protect);

// Juuripolun reitit (/api/diary)
// GET - hae kaikki päiväkirjamerkinnät
// POST - luo uusi merkintä
router.route('/')
  .get(getDiaryEntries)
  .post(createDiaryEntry);

// ID-parametrin sisältävät reitit (/api/diary/:id)
// GET - hae yksittäinen merkintä
// PUT - päivitä merkintä
// DELETE - poista merkintä
router.route('/:id')
  .get(getDiaryEntry)
  .put(updateDiaryEntry)
  .delete(deleteDiaryEntry);

export default router;