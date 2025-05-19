// This file is a Vercel serverless function entry point
import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Define custom error interface
interface ErrorWithStatus extends Error {
  status?: number;
  message: string;
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());

// Main API route - add your API endpoints here
app.post('/api/worksheet/generate', (req: Request, res: Response) => {
  try {
    // This is a placeholder for the actual implementation
    const { text, grade, subject } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // In a real implementation, this would call the OpenAI API
    // For now, just return a mock response
    res.status(200).json({
      success: true,
      worksheet: {
        questions: [
          { id: 1, question: 'Sample question 1 about ' + text.substring(0, 20) + '...?' },
          { id: 2, question: 'Sample question 2 about ' + text.substring(0, 20) + '...?' },
        ],
        title: `Worksheet for ${subject || 'General'} (Grade ${grade || 'K-12'})`,
        text: text.substring(0, 100) + '...'
      }
    });
  } catch (error) {
    console.error('Error generating worksheet:', error);
    res.status(500).json({ error: 'Failed to generate worksheet' });
  }
});

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// Export the Express app as a Vercel serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  // Log incoming requests in production for debugging
  if (process.env.NODE_ENV === 'production') {
    console.log(`API Request: ${req.method} ${req.url}`);
  }
  
  return app(req, res);
};
