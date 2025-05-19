import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY is missing in environment variables');
  console.error('Please create a .env file in the server directory with your OpenAI API key');
  console.error('Example: OPENAI_API_KEY=your_openai_api_key_here');
  process.exit(1);
}

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Initialize OpenAI with explicit configuration
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
  // Removed dangerouslyAllowBrowser flag for security reasons
});

export interface OpenAIConfig {
  model: string;
  temperature: number;
  systemMessage: string;
}

export const OPENAI_CONFIG: OpenAIConfig = {
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  systemMessage: "You are an expert educator specializing in creating engaging, age-appropriate reading materials. Always respond with properly formatted JSON."
};
