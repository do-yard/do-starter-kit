import { serverConfig } from 'settings/settings';
import { BillingService } from './billing';
import Stripe from 'stripe';

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
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
    });
  }

  async listSubscription(customerId: string) {
    return await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });
  }

  async cancelSubscription(subscriptionId: string) {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(id: string, priceId: string) {
    return await this.stripe.subscriptions.update(id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: process.env.NEXT_PUBLIC_PRO_PRICE_ID,
        },
      ],
      proration_behavior: 'always_invoice',
      payment_behavior: 'default_incomplete',
      // expand: ["latest_invoice.payment_intent"],
    });
  }
}
