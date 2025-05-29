import { serverConfig } from 'settings/settings';
import { BillingService } from './billing';
import Stripe from 'stripe';

/**
 * StripeBillingService is a service that implements the BillingService interface
 * using the Stripe API for managing billing operations such as customers and subscriptions.
 */
export class StripeBillingService implements BillingService {
  private stripe: Stripe;

  constructor() {
    if (!serverConfig.Stripe.stripeSecretKey) {
      throw new Error('Missing Stipe Secret Key');
    }

    this.stripe = new Stripe(serverConfig.Stripe.stripeSecretKey!, {
      apiVersion: '2025-04-30.basil',
    });
  }

  async listCustomer(email: string) {
    const result = await this.stripe.customers.list({
      email: email,
      limit: 1,
    });

    return result.data.map((customer) => ({ id: customer.id }));
  }

  async createCustomer(email: string, metadata?: Record<string, string>) {
    return await this.stripe.customers.create({
      email: email,
      metadata: metadata,
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    const result = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
    });

    if (
      result.latest_invoice &&
      typeof result.latest_invoice !== 'string' &&
      'payment_intent' in result.latest_invoice &&
      result.latest_invoice.payment_intent &&
      typeof result.latest_invoice.payment_intent !== 'string'
    ) {
      return {
        clientSecret:
          (result.latest_invoice.payment_intent as Stripe.PaymentIntent).client_secret ?? undefined,
      };
    }

    return {
      clientSecret: undefined,
    };
  }

  async listSubscription(customerId: string) {
    const result = await this.stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    return result.data.map((subscription) => ({
      id: subscription.id,
      status: subscription.status,
      items: subscription.items.data.map((item) => ({ id: item.id, priceId: item.price.id })),
    }));
  }

  async cancelSubscription(subscriptionId: string) {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(id: string, itemId: string, priceId: string) {
    const result = await this.stripe.subscriptions.update(id, {
      items: [
        {
          id: itemId,
          price: priceId,
        },
      ],
      proration_behavior: 'always_invoice',
      payment_behavior: 'default_incomplete',
    });

    if (
      result.latest_invoice &&
      typeof result.latest_invoice !== 'string' &&
      'payment_intent' in result.latest_invoice &&
      result.latest_invoice.payment_intent &&
      typeof result.latest_invoice.payment_intent !== 'string'
    ) {
      return {
        clientSecret:
          (result.latest_invoice.payment_intent as Stripe.PaymentIntent).client_secret ?? undefined,
      };
    }

    return {
      clientSecret: undefined,
    };
  }
}
