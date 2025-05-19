#!/bin/bash

# ------------------------------
# Simplified Vercel build script
# ------------------------------

set -e  # Exit immediately on error

echo "Starting simplified Vercel build process..."

# 1. Build client -----------------------------------------------------------
cd server/client

# Install ALL dependencies (prod + dev). NODE_ENV must **not** be production
npm install --include=dev

# Ensure Vite/tooling present even if lock file was cached without dev deps
npm install --no-save vite @vitejs/plugin-react @heroicons/react

# Build client (outputs to dist/)
echo "Building client application with Vite..."
npx vite build

# 2. Prepare public directory ------------------------------------------------
cd ../..  # back to repo root

# Create public directory
echo "Creating public directory..."
mkdir -p public

# Copy built static assets to public
echo "Copying static assets to public..."
cp -r server/client/dist/* public/

# 3. Create serverless functions ---------------------------------------------
echo "Creating serverless functions..."
mkdir -p api

# Create a simple health check function
cat > api/health.js << EOF
module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
};
EOF

# Create worksheet generation API endpoint
cat > api/generate-worksheet.js << EOF
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const OPENAI_CONFIG = {
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  systemMessage: "You are an expert educator specializing in creating engaging, age-appropriate reading materials. Always respond with properly formatted JSON."
};

async function generateWorksheetContent(gradeLevel, topic, complexity = 'medium') {
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

module.exports = async (req, res) => {
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
EOF

echo "Build process completed successfully!"
