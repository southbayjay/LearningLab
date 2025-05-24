import { NextRequest, NextResponse } from 'next/server';
import { generateWorksheetContent } from '@/lib/openai';
import { z } from 'zod';

// Configure this route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

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

    // Get Cloudflare environment for API key access
    let cfEnv: Record<string, unknown> | undefined;
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const ctx = getRequestContext();
      cfEnv = ctx?.env as Record<string, unknown>;
    } catch {
      // Ignore if not available
    }

    // Generate the worksheet using OpenAI
    const worksheet = await generateWorksheetContent(gradeLevel, topic, complexity, cfEnv);

    return NextResponse.json(worksheet);
  } catch (error: unknown) {
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
        details: errorDetails,
        debug: {
          hasApiKey: !!process.env.OPENAI_API_KEY,
          runtime: 'edge'
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Try different ways to access environment variables in Cloudflare Pages
    const envKey1 = process.env.OPENAI_API_KEY;
    const envKey2 = (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.OPENAI_API_KEY;
    const envKey3 = (globalThis as Record<string, unknown>).OPENAI_API_KEY as string | undefined;
    
    // Try accessing through Cloudflare context
    let cfEnvKey: string | undefined;
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const ctx = getRequestContext();
      cfEnvKey = (ctx?.env as Record<string, unknown>)?.OPENAI_API_KEY as string | undefined;
    } catch {
      // Ignore if not available
    }
    
    return NextResponse.json({ 
      message: 'Worksheet generation API is running',
      runtime: 'edge',
      timestamp: new Date().toISOString(),
      debug: {
        hasApiKey1: !!envKey1,
        hasApiKey2: !!envKey2,
        hasApiKey3: !!envKey3,
        hasApiKeyCF: !!cfEnvKey,
        keyLength1: envKey1?.length || 0,
        keyLength2: envKey2?.length || 0,
        keyLength3: envKey3?.length || 0,
        keyLengthCF: cfEnvKey?.length || 0,
        envKeys: Object.keys(process.env || {}).filter(key => key.includes('OPENAI')),
        allEnvCount: Object.keys(process.env || {}).length,
        globalKeys: Object.keys(globalThis).filter(key => key.includes('OPENAI')),
        cfEnvKeys: cfEnvKey ? 'CF_ENV_AVAILABLE' : 'CF_ENV_NOT_AVAILABLE'
      },
      status: 'healthy'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'GET failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
