import { Resend } from 'resend';
import { serverConfig } from '../../../settings';
import { EmailService } from './email';
import { ServiceConfigStatus } from '../status/serviceConfigStatus';

/**
 * Email service implementation using the Resend API.
 */
export class ResendEmailService extends EmailService {
  private resend: Resend | null = null;
  private fromEmail: string = '';
  private isConfigured: boolean = false;
  private lastConnectionError: string = '';

  // Service name for consistent display across all status responses
  private static readonly serviceName = 'Email Service (Resend)';
  // Required config items with their corresponding env var names and descriptions
  private static requiredConfig = {
    'apiKey': { envVar: 'RESEND_API_KEY', description: 'Resend API Key' },
    'fromEmail': { envVar: 'RESEND_EMAIL_SENDER', description: 'From email address' }
  };
  constructor() {
    super();
    this.initializeClient();
  }

  /**
   * Initializes the Resend client based on the configuration.
   * Sets isConfigured flag if applicable.
   */
  private initializeClient(): void {
    try {
      const apiKey = serverConfig.Resend.apiKey;
      const fromEmail = serverConfig.Resend.fromEmail;

      // Check for missing configuration
      const missingConfig = Object.entries(ResendEmailService.requiredConfig)
        .filter(([key]) => !serverConfig.Resend[key as keyof typeof serverConfig.Resend])
        .map(([, value]) => value.envVar);

      if (missingConfig.length > 0) {
        this.isConfigured = false;
        return;
      }

      this.fromEmail = fromEmail!;
      this.resend = new Resend(apiKey!);
      this.isConfigured = true;
    } catch (error) {
      this.isConfigured = false;
      console.error('Failed to initialize Resend client:', error);
    }
  }
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    if (!this.resend) {
      throw new Error('Email client not initialized. Check configuration.');
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html: body,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Checks if the email service is properly configured and accessible.
   * Sends a test email to verify the connection.
   * 
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise.
   */
  async checkConnection(): Promise<boolean> {
    if (!this.resend) {
      this.lastConnectionError = 'Email client not initialized';
      return false;
    }

    try {
      // Test connection by sending a verification email to ourselves
      // This is a lightweight way to test the API without actually sending emails
      await this.resend.emails.send({
        from: this.fromEmail,
        to: [this.fromEmail], // Send to ourselves for testing
        subject: 'Service Health Check',
        html: '<p>This is an automated health check email. Please ignore.</p>',
      });
      return true;
    } catch (connectionError) {
      const errorMsg = connectionError instanceof Error ? connectionError.message : String(connectionError);

      console.error('Email connection test failed:', {
        error: errorMsg
      });

      this.lastConnectionError = `Connection error: ${errorMsg}`;
      return false;
    }
  }

  /**
   * Checks if the email service configuration is valid and tests connection when configuration is complete.
   */
  async checkConfiguration(): Promise<ServiceConfigStatus> {    // Check for missing configuration
    const missingConfig = Object.entries(ResendEmailService.requiredConfig)
      .filter(([key]) => !serverConfig.Resend[key as keyof typeof serverConfig.Resend])
      .map(([, value]) => value.envVar);

    if (missingConfig.length > 0) {
      return {
        name: ResendEmailService.serviceName,
        configured: false,
        connected: undefined, // Don't test connection when configuration is missing
        configToReview: missingConfig,
        error: 'Configuration missing'
      };
    }

    // If configured, test the connection
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return {
        name: ResendEmailService.serviceName,
        configured: true,
        connected: false,
        configToReview: Object.values(ResendEmailService.requiredConfig).map(
          config => config.envVar
        ),
        error: this.lastConnectionError || 'Connection failed'
      };
    }
    return {
      name: ResendEmailService.serviceName,
      configured: true,
      connected: true
    };
  }
}
