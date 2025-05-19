import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Define the complexity type
export type Complexity = 'easy' | 'medium' | 'hard';

// Input validation schema
export const worksheetRequestSchema = z.object({
  gradeLevel: z.string(),
  topic: z.string(),
  complexity: z.enum(['easy', 'medium', 'hard']).optional(),
});

// Extract the inferred type from the schema
export type WorksheetRequest = z.infer<typeof worksheetRequestSchema>;

export const validateWorksheetRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    worksheetRequestSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    } else {
      res.status(400).json({
        error: 'Invalid request data',
        details: 'Unknown validation error'
      });
    }
  }
};
