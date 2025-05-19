import { Request, Response } from 'express';
import { generateWorksheetContent } from '../services/openaiService';

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
    console.error('Error generating worksheet:', error);
    let errorMessage = 'Failed to generate worksheet';
    let errorDetails = 'No additional details available';
    
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
      // Type assertion for OpenAI error structure
      const openAIError = error as any;
      errorDetails = openAIError.response?.body || errorDetails;
    }
    
    res.status(500).json({
      error: errorMessage,
      details: errorDetails
    });
  }
};

export const healthCheck = (req: Request, res: Response): void => {
  res.json({ status: 'healthy' });
};
