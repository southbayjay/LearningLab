import express from 'express';
import { generateWorksheet, healthCheck } from '../controllers/worksheetController.js';
import { validateWorksheetRequest } from '../middleware/validation.js';

const router = express.Router();

router.post('/generate-worksheet', validateWorksheetRequest, generateWorksheet);
router.get('/health', healthCheck);

export default router;
