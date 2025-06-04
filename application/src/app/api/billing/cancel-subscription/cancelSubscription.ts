import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';
import { createDatabaseClient } from 'services/database/database';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { serverConfig } from '../../../../../settings';

/**
 * Cancel an active subscription for a user.
 *
 * @param user - The user object containing id and role and email.
 */
export const cancelSubscription = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const billingService = createBillingService();
    const db = createDatabaseClient();

    const customer = await billingService.listCustomer(user.email);

    if (!customer || !customer[0]) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customerId = customer[0].id;
    const stripeSubscriptions = await billingService.listSubscription(customerId);

    const stripeSub = stripeSubscriptions[0];
    if (!stripeSub) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    const dbSubscription = await db.subscription.findByUserId(user.id);

    if (!dbSubscription || !dbSubscription[0]) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    if (dbSubscription[0].plan === SubscriptionPlanEnum.PRO) {
      await billingService.updateSubscription(
        stripeSub.id,
        stripeSub.items[0].id,
        serverConfig.Stripe.freePriceId!
      );
      await db.subscription.update(user.id, {
        plan: SubscriptionPlanEnum.FREE,
        status: SubscriptionStatusEnum.PENDING,
      });
      return NextResponse.json({ canceled: true });
    }

    await billingService.cancelSubscription(stripeSub.id);

    await db.subscription.update(user.id, {
      status: SubscriptionStatusEnum.PENDING,
    });

    return NextResponse.json({ canceled: true });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
