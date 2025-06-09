import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';
import { HTTP_STATUS } from 'lib/api/http';

/**
 * API endpoint to verify a user's email address using a verification token.
 * Finds the user by the provided token, marks the email as verified, and clears the token.
 * Returns a success or error response depending on the outcome.
 *
 * Query parameters:
 *   - token: string (required)
 *
 * Response:
 *   - 200: { success: true }
 *   - 400: { error: string }
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: HTTP_STATUS.BAD_REQUEST });
  }
  const db = createDatabaseClient();
  // Find user by verification token
  const user = await db.user.findByVerificationToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: HTTP_STATUS.BAD_REQUEST });
  }
  // Mark email as verified and clear the token
  await db.user.update(user.id, { emailVerified: true, verificationToken: null });
  return NextResponse.json({ success: true });
}
