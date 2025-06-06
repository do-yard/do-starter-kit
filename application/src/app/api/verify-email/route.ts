import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }
  const db = createDatabaseClient();
  // Find user by verification token
  const user = await db.user.findByVerificationToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  // Mark email as verified and clear the token
  await db.user.update(user.id, { emailVerified: true, verificationToken: null });
  return NextResponse.json({ success: true });
}
