import express from 'express';
import { generateWorksheet, healthCheck } from '../controllers/worksheetController.js';
import { validateWorksheetRequest } from '../middleware/validation.js';

const router = express.Router();

// API routes
router.post('/generate-worksheet', validateWorksheetRequest, generateWorksheet);
router.get('/health', healthCheck);

// 404 handler for /api/* routes
router.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default router;
