import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import OpenAI from 'openai';

const currentDir = dirname(fileURLToPath(import.meta.url));

// Load environment variables from the server/.env file
dotenv.config({ path: join(currentDir, '../../.env') });

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\nPlease create a .env file in the project root with the required variables.');
  console.error('Example .env file:');
  console.error('  OPENAI_API_KEY=your_openai_api_key_here');
  console.error('  PORT=3001');
  process.exit(1);
}

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Initialize OpenAI with explicit configuration
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Removed dangerouslyAllowBrowser flag for security reasons
});

export interface OpenAIConfig {
  model: string;
  systemMessage: string;
}

export const OPENAI_CONFIG: OpenAIConfig = {
  // gpt-5-mini only supports the default temperature, so none is configured
  model: 'gpt-5-mini',
  systemMessage:
    'You are an expert educator specializing in creating engaging, age-appropriate reading materials. Always respond with properly formatted JSON.',
};
