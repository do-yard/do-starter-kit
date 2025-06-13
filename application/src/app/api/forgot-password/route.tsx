import { NextRequest, NextResponse } from 'next/server';
import { createEmailService } from 'services/email/emailFactory';
import { createDatabaseService } from 'services/database/databaseFactory';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordEmail } from 'services/email/templates/ResetPasswordEmail';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await createDatabaseService();
    const user = await db.user.findByEmail(email);
    if (!user) {
      // For security, do not reveal if user exists
      return NextResponse.json({ success: true });
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.verificationToken.create({
      identifier: email,
      token,
      expires,
    });

    const emailService = await createEmailService();
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    await emailService.sendReactEmail(
      email,
      'Reset your password',
      <ResetPasswordEmail resetUrl={resetUrl} userEmail={email} />
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
