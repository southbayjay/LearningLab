import { Request, Response } from 'express';

import { generateWorksheetContent } from '../services/openaiService.js';

interface WorksheetRequest {
  gradeLevel: string;
  topic: string;
  complexity?: 'easy' | 'medium' | 'hard';
}

export const generateWorksheet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gradeLevel, topic, complexity = 'medium' } = req.body as WorksheetRequest;
    console.log('Generating worksheet for:', { gradeLevel, topic, complexity });

    const worksheet = await generateWorksheetContent(gradeLevel, topic, complexity);
    res.json(worksheet);
  } catch (error) {
    // Upstream errors can embed provider details and partially masked API keys,
    // so they are logged server-side and never forwarded to the client.
    console.error('Error generating worksheet:', error);

    res.status(500).json({
      error: 'Failed to generate worksheet',
      details: 'Please try again. If the problem persists, contact support.',
    });
  }
};

export const healthCheck = (req: Request, res: Response): void => {
  res.json({ status: 'healthy' });
};
