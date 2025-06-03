import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';
import { createDatabaseClient } from 'services/database/database';
import { SubscriptionStatusEnum } from 'types';

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

    const customers = await billingService.listCustomer(user.email);

    if (customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customerId = customers[0].id;
    const subscriptions = await billingService.listSubscription(customerId);

    const sub = subscriptions[0];
    if (!sub) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    await billingService.cancelSubscription(sub.id);

    const db = createDatabaseClient();

    await db.subscription.update(user.id, {
      status: SubscriptionStatusEnum.PENDING,
    });

    return NextResponse.json({ canceled: true });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
