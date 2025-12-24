import express from 'express';
import { getJournalByDate, upsertJournal, deleteJournalByDate } from '../controllers/journalController.js';

const router = express.Router();

router.get('/', getJournalByDate);
router.put('/', upsertJournal);
router.delete('/', deleteJournalByDate);

export default router;
