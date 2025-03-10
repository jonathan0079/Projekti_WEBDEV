import express from 'express';
import { 
  getDiaryEntries, 
  getDiaryEntry, 
  createDiaryEntry, 
  updateDiaryEntry, 
  deleteDiaryEntry 
} from '../controllers/diary-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for /api/diary
router.route('/')
  .get(getDiaryEntries)
  .post(createDiaryEntry);

// Routes for /api/diary/:id
router.route('/:id')
  .get(getDiaryEntry)
  .put(updateDiaryEntry)
  .delete(deleteDiaryEntry);

export default router;