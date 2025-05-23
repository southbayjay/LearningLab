import OpenAI from 'openai';
import { Worksheet, Complexity } from '@/types/worksheet';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateWorksheetContent(
  gradeLevel: string,
  topic: string,
  complexity: Complexity = 'medium'
): Promise<Worksheet> {
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

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert educator who creates high-quality reading comprehension materials. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the JSON response
    const worksheet = JSON.parse(content) as Worksheet;
    
    // Validate the structure
    if (!worksheet.title || !worksheet.passage || !worksheet.multipleChoice || !worksheet.shortAnswer) {
      throw new Error('Invalid worksheet structure received');
    }

    return worksheet;
  } catch (error) {
    console.error('Error generating worksheet:', error);
    throw new Error(`Failed to generate worksheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
