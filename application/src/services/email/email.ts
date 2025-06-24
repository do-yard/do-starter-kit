import { ServiceConfigStatus, ConfigurableService } from '../status/serviceConfigStatus';

/**
 * Abstract base class for all email providers.
 * Provides a common interface for email operations across different email services.
 */
export abstract class EmailService implements ConfigurableService {
  abstract sendReactEmail(
    to: string,
    subject: string,
    contentComponent: React.ReactNode
  ): Promise<void>;

  abstract checkConnection(): Promise<boolean>;

  abstract checkConfiguration(): Promise<ServiceConfigStatus>;

  abstract isEmailEnabled(): boolean;

  isRequired(): boolean {
    return true;
  }
}
