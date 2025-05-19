import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';

// Get the current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the server/.env file
dotenv.config({ path: join(__dirname, '../../.env') });

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
