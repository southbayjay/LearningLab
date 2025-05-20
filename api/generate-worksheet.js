const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const OPENAI_CONFIG = {
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  systemMessage: "You are an expert educator specializing in creating engaging, age-appropriate reading materials. Always respond with properly formatted JSON."
};

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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
