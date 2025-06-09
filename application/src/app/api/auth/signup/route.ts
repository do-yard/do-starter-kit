import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';
import { hashPassword } from 'helpers/hash';
import { USER_ROLES } from 'lib/auth/roles';
import { v4 as uuidv4 } from 'uuid';
import { createEmailClient } from 'services/email/email';
import { emailTemplate } from 'services/email/emailTemplate';
import { HTTP_STATUS } from 'lib/api/http';

/**
 * API endpoint for user registration. Creates a new user, sends a verification email with a secure token,
 * and returns a success or error response. Handles duplicate users and missing fields. The verification email
 * uses a branded HTML template and includes a styled button for verification.
 *
 * Request body:
 *   - name: string (required)
 *   - email: string (required)
 *   - password: string (required)
 *
 * Response:
 *   - 200: { ok: true, message: string }
 *   - 400: { error: string }
 *   - 409: { error: string }
 *   - 500: { error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const dbClient = createDatabaseClient();
    const userCount = await dbClient.user.count();
    const isFirstUser = userCount === 0;

    const userExists = await dbClient.user.findByEmail(email);
    if (userExists) {
      return NextResponse.json({ error: 'User already exists' }, { status: HTTP_STATUS.CONFLICT });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = uuidv4();

    const user = await dbClient.user.create({
      name,
      email,
      image: null,
      passwordHash: hashedPassword,
      role: isFirstUser ? USER_ROLES.ADMIN : USER_ROLES.USER,
      verificationToken,
      emailVerified: false,
    });

    const emailClient = createEmailClient();
    const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    await emailClient.sendEmail(
      user.email,
      'Verify your email address',
      emailTemplate({
        title: 'Verify your email address',
        content: `<p>Thank you for signing up! Please verify your email by clicking the button below:</p>
          <p style="text-align:center; margin: 32px 0;">
            <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verifyUrl}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="12%" stroke="f" fillcolor="#0061EB">
                <w:anchorlock/>
                <center style="color:#fff;font-family:Arial,sans-serif;font-size:16px;font-weight:600;">Verify Email</center>
              </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a href="${verifyUrl}" style="display:inline-block; padding:14px 32px; background:#0061EB; color:#fff; border-radius:6px; font-size:16px; font-weight:600; text-decoration:none; letter-spacing:0.5px; box-shadow:0 2px 8px rgba(0,0,0,0.04); border: none; mso-padding-alt:0; mso-border-alt:none;">Verify Email</a>
            <!--<![endif]-->
          </p>
          <p style="font-size:13px; color:#888; text-align:center;">If the button doesn't work, copy and paste this link into your browser:<br><span style="word-break:break-all; color:#0061EB;">${verifyUrl}</span></p>`,
      })
    );

    return NextResponse.json({ ok: true, message: 'Verification email sent.' });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
