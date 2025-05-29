import { Resend } from 'resend';
import { serverConfig } from '../../../settings';
import { EmailService } from './email';

export class ResendEmailService implements EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    if (!serverConfig.Resend.apiKey || !serverConfig.Resend.fromEmail) {
        throw new Error('Missing Resend API key or from email configuration.');
    }

    this.fromEmail = serverConfig.Resend.fromEmail;
    this.resend = new Resend(serverConfig.Resend.apiKey);
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html: body,
      });
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
        }
    }
}