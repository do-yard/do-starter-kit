import { serverConfig } from '../../../settings';
import { ResendEmailService } from './resendEmailService';

export interface EmailService {
  sendEmail: (to: string, subject: string, body: string) => Promise<void>;
}

/**
 * Interface and factory for email service clients.
 */
// Factory function to create the appropriate email service
export function createEmailClient(): EmailService {
  const emailProvider = serverConfig.emailProvider;

  switch (emailProvider) {
    // Add more providers here in the future
    case 'Resend':
    default:
      return new ResendEmailService();
  }
}
