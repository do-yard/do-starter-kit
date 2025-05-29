import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('Received webhook request:', request);
  return NextResponse.json({ status: 200 });
}
