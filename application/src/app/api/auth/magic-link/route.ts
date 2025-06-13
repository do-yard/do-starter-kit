import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';
import { createEmailService } from 'services/email/emailFactory';
import { v4 as uuidv4 } from 'uuid';
import { emailTemplate } from 'services/email/emailTemplate';

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

    const emailClient = await createEmailService();
    const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/magic-link?token=${token}&email=${encodeURIComponent(email)}`;
    await emailClient.sendEmail(
      user.email,
      'Login to your account',
      emailTemplate({
        title: 'Login to your account',
        content: `<p>You can login to your DigitalOcean Starter Kit account by clicking the button below:</p>
          <p style="text-align:center; margin: 32px 0;">
            <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verifyUrl}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="12%" stroke="f" fillcolor="#0061EB">
                <w:anchorlock/>
                <center style="color:#fff;font-family:Arial,sans-serif;font-size:16px;font-weight:600;">Login</center>
              </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a href="${verifyUrl}" style="display:inline-block; padding:14px 32px; background:#0061EB; color:#fff; border-radius:6px; font-size:16px; font-weight:600; text-decoration:none; letter-spacing:0.5px; box-shadow:0 2px 8px rgba(0,0,0,0.04); border: none; mso-padding-alt:0; mso-border-alt:none;">Login</a>
            <!--<![endif]-->
          </p>
          <p style="font-size:13px; color:#888; text-align:center;">If the button doesn't work, copy and paste this link into your browser:<br><span style="word-break:break-all; color:#0061EB;">${verifyUrl}</span></p>`,
      })
    );

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
