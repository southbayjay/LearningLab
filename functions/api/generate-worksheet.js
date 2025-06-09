// Cloudflare Pages API Route for Worksheet Generation
// Updated: 2025-06-09 - Force deployment with new API key
import { OpenAI } from 'openai';

const OPENAI_CONFIG = {
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  systemMessage: "You are an expert educator specializing in creating engaging, age-appropriate reading materials. Always respond with properly formatted JSON."
};

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
    temperature: OPENAI_CONFIG.temperature,
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

    // Check if OpenAI API key is available
    if (!env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          details: 'OpenAI API key not configured',
          debug: {
            hasApiKey: false,
            runtime: "edge"
          }
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
    console.error('Error generating worksheet:', error);
    
    return new Response(JSON.stringify({
      error: "Failed to generate worksheet",
      details: `Failed to generate worksheet: ${error.message}`,
      debug: {
        hasApiKey: !!env.OPENAI_API_KEY,
        runtime: "edge"
      }
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
