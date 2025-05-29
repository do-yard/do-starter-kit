import { NextRequest, NextResponse } from 'next/server';
import { ResendEmailService } from '../../../services/email/resendEmailService';

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