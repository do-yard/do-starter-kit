import { ConfigurableService, ServiceConfigStatus } from 'services/status/serviceConfigStatus';

// Billing provider types
export type BillingProvider = 'Stripe';

/**
 * Abstract base class for billing clients.
 * Provides a common interface for billing operations across different billing providers.
 */
export abstract class BillingService implements ConfigurableService {
  abstract listCustomer(email: string): Promise<{ id: string }[]>;
  abstract createCustomer(
    email: string,
    metadata?: Record<string, string>
  ): Promise<{ id: string }>;
  abstract listSubscription(
    customerId: string
  ): Promise<{ id: string; status: string; items: { id: string }[] }[]>;
  abstract createSubscription(
    customerId: string,
    priceId: string
  ): Promise<{ clientSecret: string | undefined }>;
  abstract cancelSubscription(subscriptionId: string): Promise<void>;
  abstract updateSubscription(
    id: string,
    itemId: string,
    priceId: string
  ): Promise<{ clientSecret: string | undefined }>;
  abstract manageSubscription(
    priceId: string,
    customerId: string,
    returnUrl: string
  ): Promise<string | null>;
  abstract getProducts(): Promise<
    {
      priceId: string;
      amount: number;
      interval: string | null;
      name: string;
      description: string;
      features: string[];
    }[]
  >;

  abstract checkConnection(): Promise<boolean>;

  abstract checkConfiguration(): Promise<ServiceConfigStatus>;

  /**
   * Default implementation: billing services are not required by default.
   */
  isRequired(): boolean {
    return true;
  }
}
