import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    return NextResponse.json({ 
      message: 'Test API is working',
      runtime: 'edge',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
