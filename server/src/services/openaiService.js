import { openai, OPENAI_CONFIG } from '../config/index.js';

export const generateWorksheetContent = async (gradeLevel, topic, complexity = 'medium') => {
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
  return JSON.parse(content);
};
