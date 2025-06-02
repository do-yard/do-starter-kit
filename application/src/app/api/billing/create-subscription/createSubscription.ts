import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';
import { createDatabaseClient } from 'services/database/database';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { serverConfig } from '../../../../../settings';

/**
 * Creates a subscription for a user. Free or Pro plans are supported.
 *
 * @param user - The user object containing id and role and email.
 */
export const createSubscription = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const billingService = createBillingService();

    const { priceId }: { priceId: string } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const customers = await billingService.listCustomer(user.email);

    let customerId;

    if (customers.length > 0) {
      customerId = customers[0].id;
    }

    const db = createDatabaseClient();

    if (!customerId) {
      const customer = await billingService.createCustomer(user.email, {
        userId: user.email,
      });
      customerId = customer.id;
      await db.subscription.create({
        customerId: customer.id,
        plan: null,
        status: null,
        userId: user.id,
      });
    }

    const { clientSecret } = await billingService.createSubscription(customerId, priceId);

    await db.subscription.update(user.id, {
      status: SubscriptionStatusEnum.PENDING,
      plan:
        priceId === serverConfig.Stripe.proPriceId
          ? SubscriptionPlanEnum.PRO
          : SubscriptionPlanEnum.FREE,
    });

    return NextResponse.json({ clientSecret });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
