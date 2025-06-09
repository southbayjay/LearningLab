import express from 'express';

import { generateWorksheet, healthCheck } from '../controllers/worksheetController.js';
import { worksheetRateLimit, worksheetSlowDown } from '../middleware/rateLimiting.js';
import { validateWorksheetRequest } from '../middleware/validation.js';

const router = express.Router();

// API routes with specific security for worksheet generation
router.post(
  '/generate-worksheet',
  worksheetRateLimit, // 10 requests per hour limit
  worksheetSlowDown, // Progressive delays after 3 requests
  validateWorksheetRequest, // Enhanced input validation
  generateWorksheet
);

router.get('/health', healthCheck);

// 404 handler for /api/* routes
router.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default router;
