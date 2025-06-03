import { serverConfig } from '../../../settings';
import { StripeBillingService } from './stripeBillingService';

// Billing provider types
export type BillingProvider = 'Stripe';

// Common interface for all billing providers
export interface BillingService {
  listCustomer: (email: string) => Promise<{ id: string }[]>;
  createCustomer: (email: string, metadata?: Record<string, string>) => Promise<{ id: string }>;
  listSubscription: (
    customerId: string
  ) => Promise<{ id: string; status: string; items: { id: string }[] }[]>;
  createSubscription: (
    customerId: string,
    priceId: string
  ) => Promise<{ clientSecret: string | undefined }>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  updateSubscription: (
    id: string,
    itemId: string,
    priceId: string
  ) => Promise<{ clientSecret: string | undefined }>;
  checkout: (
    priceId: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string
  ) => Promise<string | null>;
}

/**
 * Factory function to create and return the appropriate billing client based on the configured provider.
 */
export function createBillingService(): BillingService {
  const storageProvider = serverConfig.billingProvider;

  switch (storageProvider) {
    // Add more providers here in the future
    // case 'AZURE':
    //   return new AzureStorageService();
    case 'Stripe':
    default:
      return new StripeBillingService();
  }
}
