import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { serverConfig } from '../../../../../settings';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

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
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    let customerId;

    const db = await createDatabaseService();

    const subscription = await db.subscription.findByUserId(user.id);

    if (subscription.length) {
      customerId = subscription[0].customerId;
    }

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
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
