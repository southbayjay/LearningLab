import { z } from 'zod';

// Input validation schema
export const worksheetRequestSchema = z.object({
  gradeLevel: z.string(),
  topic: z.string(),
  complexity: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const validateWorksheetRequest = (req, res, next) => {
  try {
    worksheetRequestSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Invalid request data',
      details: error.errors
    });
  }
};
