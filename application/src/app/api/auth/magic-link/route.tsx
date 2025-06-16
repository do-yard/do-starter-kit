import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';
import { createEmailService } from 'services/email/emailFactory';
import { v4 as uuidv4 } from 'uuid';
import { emailTemplate } from 'services/email/emailTemplate';
import { ActionButtonEmailTemplate } from 'services/email/templates/ActionButtonEmail';

/**
 * API endpoint to send a magic link for user login.
 * Accepts an email address, generates a verification token, and sends an email with the login link.
 *
 * Request body:
 *   - email: string (required)
 *
 * Response:
 *   - 200: { ok: true, token: string }
 *   - 400: { error: string }
 *   - 404: { error: 'User not found' }
 *   - 500: { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const db = await createDatabaseService();
    const user = await db.user.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // Generate a random token and expiry
    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    // Store the token in the verificationToken table
    await db.verificationToken.create({ identifier: email, token, expires });

    const emailService = await createEmailService();
    const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/magic-link?token=${token}&email=${encodeURIComponent(email)}`;
    await emailService.sendReactEmail(
      user.email,
      'Login to your account',
      <ActionButtonEmailTemplate
        title="Login to your account"
        buttonUrl={verifyUrl}
        buttonText="Login"
        greetingText="Hi, You can login to your DigitalOcean Starter Kit account by clicking the button below:"
        infoText=""
        fallbackText="If the button above does not work, copy and paste the following link into your browser:"
        fallbackUrlLabel={verifyUrl}
      />
    );

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
