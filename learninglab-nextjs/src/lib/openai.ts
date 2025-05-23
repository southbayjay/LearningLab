import { Worksheet, Complexity } from '@/types/worksheet';

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
    // Try multiple ways to access the API key
    let apiKey = process.env.OPENAI_API_KEY;
    
    // Try Cloudflare-specific access if process.env doesn't work
    if (!apiKey) {
      try {
        const { getRequestContext } = await import('@cloudflare/next-on-pages');
        const ctx = getRequestContext();
        apiKey = (ctx?.env as Record<string, unknown>)?.OPENAI_API_KEY as string;
      } catch {
        // Ignore if not available
      }
    }
    
    console.log('OpenAI function called with:', { gradeLevel, topic, complexity });
    console.log('API Key check:', { 
      hasKey: !!apiKey, 
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 10) || 'none'
    });
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response data keys:', Object.keys(data));
    
    const content = data.choices[0]?.message?.content;
    console.log('Content received:', { 
      hasContent: !!content, 
      contentLength: content?.length || 0,
      contentPreview: content?.substring(0, 100) || 'none'
    });
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the JSON response
    console.log('Parsing JSON response...');
    const worksheet = JSON.parse(content) as Worksheet;
    
    // Validate the structure
    if (!worksheet.title || !worksheet.passage || !worksheet.multipleChoice || !worksheet.shortAnswer) {
      throw new Error('Invalid worksheet structure received');
    }

    console.log('Worksheet generated successfully');
    return worksheet;
  } catch (error) {
    console.error('Error in generateWorksheetContent:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw new Error(`Failed to generate worksheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
