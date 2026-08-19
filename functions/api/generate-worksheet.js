// Cloudflare Pages API Route for Worksheet Generation
// Updated: 2025-06-09 - Force deployment with new API key
import { OpenAI } from 'openai';

const OPENAI_CONFIG = {
  model: "gpt-5-mini",
  systemMessage: "You are an expert educator specializing in creating engaging, age-appropriate reading materials. Always respond with properly formatted JSON."
};

// Mirrors server/src/middleware/validation.ts so the serverless path enforces
// the same constraints as the Express server before user input reaches OpenAI.
const VALID_GRADE_LEVELS = [
  'k', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
  'kindergarten',
  '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th',
  'elementary', 'middle school', 'high school',
];

const INAPPROPRIATE_WORDS = [
  'violence', 'weapon', 'drug', 'alcohol', 'sex', 'sexual', 'porn', 'adult',
  'hate', 'racism', 'terrorist', 'bomb', 'kill', 'death', 'suicide',
  'gambling', 'casino', 'bet', 'political', 'religion', 'religious',
];

function validateWorksheetRequest({ gradeLevel, topic, complexity }) {
  if (typeof gradeLevel !== 'string' || gradeLevel.length < 1 || gradeLevel.length > 20) {
    return 'gradeLevel must be a string of 1-20 characters';
  }
  const normalizedGrade = gradeLevel.toLowerCase().trim().replace(/\s+grade$/, '');
  if (!VALID_GRADE_LEVELS.includes(normalizedGrade)) {
    return 'Invalid grade level. Please use K-12, Kindergarten-12th, Elementary, Middle School, or High School.';
  }
  if (typeof topic !== 'string' || topic.trim().length < 3 || topic.length > 100) {
    return 'topic must be a string of 3-100 characters';
  }
  const lowerTopic = topic.toLowerCase();
  if (INAPPROPRIATE_WORDS.some(word => lowerTopic.includes(word))) {
    return 'Topic contains inappropriate content. Please choose an educational topic suitable for students.';
  }
  if (/(.)\1{4,}/.test(topic)) {
    return 'Topic appears to contain spam-like content.';
  }
  if (complexity !== undefined && !['easy', 'medium', 'hard'].includes(complexity)) {
    return "complexity must be one of 'easy', 'medium', or 'hard'";
  }
  return null;
}

async function generateWorksheetContent(gradeLevel, topic, complexity = 'medium', apiKey) {
  const openai = new OpenAI({
    apiKey: apiKey
  });

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

  const completion = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    messages: [
      {
        role: "system",
        content: OPENAI_CONFIG.systemMessage
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI returned empty content');
  }
  
  return JSON.parse(content);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  try {
    // Parse request body
    const body = await request.json();
    const { gradeLevel, topic, complexity = 'medium' } = body;
    
    console.log('Generating worksheet for:', { gradeLevel, topic, complexity });

    // Validate required fields
    if (!gradeLevel || !topic) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'gradeLevel and topic are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const validationError = validateWorksheetRequest({ gradeLevel, topic, complexity });
    if (validationError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          details: validationError
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Check if OpenAI API key is available
    if (!env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          details: 'The worksheet service is not configured. Please contact support.'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Generate worksheet
    const worksheet = await generateWorksheetContent(gradeLevel, topic, complexity, env.OPENAI_API_KEY);

    return new Response(JSON.stringify(worksheet), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    // Upstream errors can embed provider details and partially masked API keys,
    // so they are logged server-side and never forwarded to the client.
    console.error('Error generating worksheet:', error);
    
    return new Response(JSON.stringify({
      error: "Failed to generate worksheet",
      details: 'Please try again. If the problem persists, contact support.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Handle OPTIONS requests for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
