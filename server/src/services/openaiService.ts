import { openai, OPENAI_CONFIG } from '../config/index';
import { Complexity } from '../middleware/validation';

// Define the worksheet response types
export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface ShortAnswerQuestion {
  question: string;
  answer: string;
}

export interface Worksheet {
  title: string;
  passage: string;
  multipleChoice: MultipleChoiceQuestion[];
  shortAnswer: ShortAnswerQuestion[];
}

export const generateWorksheetContent = async (
  gradeLevel: string,
  topic: string,
  complexity: Complexity = 'medium'
): Promise<Worksheet> => {
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
        role: 'system',
        content: OPENAI_CONFIG.systemMessage,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: OPENAI_CONFIG.temperature,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI returned empty content');
  }

  return JSON.parse(content) as Worksheet;
};
