import express from 'express';
import { generateWorksheet, healthCheck } from '../controllers/worksheetController';
import { validateWorksheetRequest } from '../middleware/validation';

const router = express.Router();

router.post('/generate-worksheet', validateWorksheetRequest, generateWorksheet);
router.get('/health', healthCheck);

export default router;
