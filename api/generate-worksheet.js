const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

async function generateWorksheetContent(gradeLevel, topic, complexity = 'medium') {
  const prompt = "Create an age-appropriate reading comprehension passage and questions for " + gradeLevel + " grade students about " + topic + ". \n    Difficulty level: " + complexity + ". \n    Include:\n    1. A title\n    2. A passage (250-400 words)\n    3. 5 multiple-choice questions\n    4. 2 short-answer questions\n    5. Answer key\n    Format the response in JSON with the following structure:\n    {\n      \"title\": \"string\",\n      \"passage\": \"string\",\n      \"multipleChoice\": [\n        {\n          \"question\": \"string\",\n          \"options\": [\"string\", \"string\", \"string\", \"string\"],\n          \"answer\": \"string\"\n        }\n      ],\n      \"shortAnswer\": [\n        {\n          \"question\": \"string\",\n          \"answer\": \"string\"\n        }\n      ]\n    }";

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

// Same-origin requests are always allowed. Additional origins can be
// allow-listed via ALLOWED_ORIGINS (comma-separated).
function resolveAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return null;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const selfOrigin = `${proto}://${host}`;
  const allowList = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  return origin === selfOrigin || allowList.includes(origin) ? origin : null;
}

module.exports = async (req, res) => {
  const allowedOrigin = resolveAllowedOrigin(req);
  res.setHeader('Vary', 'Origin');
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.headers.origin && !allowedOrigin) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { gradeLevel, topic, complexity = 'medium' } = req.body;
    console.log('Generating worksheet for:', { gradeLevel, topic, complexity });

    const validationError = validateWorksheetRequest({ gradeLevel, topic, complexity });
    if (validationError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationError
      });
    }

    const worksheet = await generateWorksheetContent(gradeLevel, topic, complexity);
    res.json(worksheet);
  } catch (error) {
    // Upstream errors can embed provider details and partially masked API keys,
    // so they are logged server-side and never forwarded to the client.
    console.error('Error generating worksheet:', error);
    res.status(500).json({
      error: 'Failed to generate worksheet',
      details: 'Please try again. If the problem persists, contact support.'
    });
  }
};
