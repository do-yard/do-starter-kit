import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';
import { createDatabaseClient } from 'services/database/database';
import { serverConfig } from 'settings/settings';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';

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

    if (!customerId) {
      const customer = await billingService.createCustomer(user.email, {
        userId: user.email,
      });
      customerId = customer.id;
    }

    const { clientSecret } = await billingService.createSubscription(customerId, priceId);

    const db = createDatabaseClient();
    await db.subscription.create({
      userId: user.id,
      status: SubscriptionStatusEnum.ACTIVE,
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
