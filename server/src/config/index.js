import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Initialize OpenAI with explicit configuration
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const OPENAI_CONFIG = {
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  systemMessage: "You are an expert educator specializing in creating engaging, age-appropriate reading materials. Always respond with properly formatted JSON."
};
