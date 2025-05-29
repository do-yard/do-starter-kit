import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';
import { createDatabaseClient } from 'services/database/database';
import { serverConfig } from 'settings/settings';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';

/**
 * Upgrades the user's subscription to Pro.
 *
 * @param user - The user object containing id and role and email.
 */
export const upgradeToPro = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const billingService = createBillingService();

    const customers = await billingService.listCustomer(user.email);

    if (customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customerId = customers[0].id;

    const subscriptions = await billingService.listSubscription(customerId);

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const subscription = subscriptions[0];

    if (!serverConfig.Stripe.proPriceId) {
      return NextResponse.json({ error: 'Pro price ID is not configured' }, { status: 500 });
    }

    const clientSecret = await billingService.updateSubscription(
      subscription.id,
      subscription.items[0].id,
      serverConfig.Stripe.proPriceId
    );

    const db = createDatabaseClient();
    const dbSubscription = await db.subscription.findByUserAndStatus(
      user.id,
      SubscriptionStatusEnum.ACTIVE
    );

    if (!dbSubscription) {
      return NextResponse.json(
        { error: 'Active subscription not found in database' },
        { status: 404 }
      );
    }

    await db.subscription.update(dbSubscription.id, {
      status: SubscriptionStatusEnum.CANCELED,
    });
    await db.subscription.create({
      userId: user.id,
      status: SubscriptionStatusEnum.ACTIVE,
      plan: SubscriptionPlanEnum.PRO,
    });

    return NextResponse.json({ clientSecret });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
