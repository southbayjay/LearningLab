import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { z } from 'zod';

// Load environment variables before creating OpenAI client
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI with explicit configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Input validation schema
const worksheetRequestSchema = z.object({
  gradeLevel: z.string(),
  topic: z.string(),
  complexity: z.enum(['easy', 'medium', 'hard']).optional(),
});

// Generate worksheet endpoint
app.post('/api/generate-worksheet', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const { gradeLevel, topic, complexity = 'medium' } = worksheetRequestSchema.parse(req.body);

    console.log('Validated request data:', { gradeLevel, topic, complexity });
    console.log('Using API key:', process.env.OPENAI_API_KEY ? 'API key is set' : 'API key is missing');

    const prompt = `Create an age-appropriate reading comprehension passage and questions for ${gradeLevel} grade students about ${topic}. 
    Difficulty level: ${complexity}. 
    Include:
    1. A title
    2. A passage (250-400 words)
    3. 5 multiple-choice questions
    4. 2 short-answer questions
    5. Answer key
    Format the response in JSON with the following structure:
    {
      "title": "string",
      "passage": "string",
      "multipleChoice": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "answer": "string"
        }
      ],
      "shortAnswer": [
        {
          "question": "string",
          "answer": "string"
        }
      ]
    }`;

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Changed to GPT-3.5 Turbo for testing
      messages: [
        {
          role: "system",
          content: "You are an expert educator specializing in creating engaging, age-appropriate reading materials. Always respond with properly formatted JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    console.log('Received response from OpenAI:', content);

    // Try to parse the response as JSON
    const jsonResponse = JSON.parse(content);
    res.json(jsonResponse);
  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      body: error.response?.body,
      status: error.status,
      headers: error.response?.headers
    });
    res.status(500).json({ 
      error: error.message,
      details: error.response?.body || 'No additional details available'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('OpenAI API Key status:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
});
