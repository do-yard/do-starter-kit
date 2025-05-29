import { NextRequest, NextResponse } from 'next/server';
import { ResendEmailService } from '../../../services/email/resendEmailService';

/**
 * Handles POST requests to send an email using the ResendEmailService.
 * Expects a JSON body with a 'to' email address.
 */
export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();
    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "to" email address.' }, { status: 400 });
    }
    const emailService = new ResendEmailService();
    await emailService.sendEmail(to, 'Testing Resend integration', 'It works');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}