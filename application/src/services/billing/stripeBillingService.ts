import { serverConfig } from '../../../settings';
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
        id: result.id,
      };
    }

    return {
      clientSecret: undefined,
      id: result.id,
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

  async manageSubscription(priceId: string, customerId: string, returnUrl: string) {
    const result = await this.stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    const subscription = result.data.map((subscription) => ({
      id: subscription.id,
      items: subscription.items.data.map((item) => ({ id: item.id, priceId: item.price.id })),
    }));

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      configuration: process.env.STRIPE_PORTAL_CONFIG_ID,
      flow_data: {
        type: 'subscription_update_confirm',
        subscription_update_confirm: {
          subscription: subscription[0].id,
          items: [
            {
              id: subscription[0].items[0].id,
              price: priceId,
              quantity: 1,
            },
          ],
        },
      },
      return_url: returnUrl,
    });

    return session.url;
  }

  async getProducts(): Promise<
    {
      priceId: string;
      amount: number;
      interval: string | null;
      name: string;
      description: string;
      features: string[];
    }[]
  > {
    const priceIds = [serverConfig.Stripe.freePriceId!, serverConfig.Stripe.proPriceId!];

    const plans = await Promise.all(
      priceIds.map(async (priceId) => {
        const price = await this.stripe.prices.retrieve(priceId, {
          expand: ['product'],
        });

        const product = price.product as Stripe.Product;

        const featuresResponse = await this.stripe.products.listFeatures(product.id);
        const features = featuresResponse.data.map((pf) => pf.entitlement_feature.name);

        return {
          priceId: price.id,
          amount: (price.unit_amount || 0) / 100,
          interval: price.recurring?.interval || null,
          name: product.name,
          description: product.description || '',
          features,
        };
      })
    );

    return plans;
  }
}
