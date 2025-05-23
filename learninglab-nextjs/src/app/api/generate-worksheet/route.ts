import { NextRequest, NextResponse } from 'next/server';
import { generateWorksheetContent } from '@/lib/openai';
import { z } from 'zod';

const WorksheetRequestSchema = z.object({
  gradeLevel: z.string().min(1, 'Grade level is required'),
  topic: z.string().min(1, 'Topic is required'),
  complexity: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = WorksheetRequestSchema.parse(body);
    const { gradeLevel, topic, complexity } = validatedData;

    console.log('Generating worksheet for:', { gradeLevel, topic, complexity });

    // Generate the worksheet using OpenAI
    const worksheet = await generateWorksheetContent(gradeLevel, topic, complexity);

    return NextResponse.json(worksheet);
  } catch (error) {
    console.error('Error generating worksheet:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    const errorMessage = 'Failed to generate worksheet';
    const errorDetails = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'healthy' });
}
