import { generateWorksheetContent } from '../services/openaiService.js';

export const generateWorksheet = async (req, res) => {
  try {
    const { gradeLevel, topic, complexity = 'medium' } = req.body;
    console.log('Generating worksheet for:', { gradeLevel, topic, complexity });

    const worksheet = await generateWorksheetContent(gradeLevel, topic, complexity);
    res.json(worksheet);
  } catch (error) {
    console.error('Error generating worksheet:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate worksheet',
      details: error.response?.body || 'No additional details available'
    });
  }
};

export const healthCheck = (req, res) => {
  res.json({ status: 'healthy' });
};
