import { NextResponse } from 'next/server';

/**
 * Handles incoming webhook requests. Dummy Implementation
 *
 */
export async function POST(request: Request) {
  console.log('Received webhook request:', request);
  return NextResponse.json({ status: 200 });
}
