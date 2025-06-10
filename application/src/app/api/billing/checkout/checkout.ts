import { NextRequest, NextResponse } from 'next/server';
import { serverConfig } from '../../../../../settings';
import { createBillingService } from 'services/billing/billing';
import { createDatabaseClient } from 'services/database/database';
import { HTTP_STATUS } from 'lib/api/http';

/**
 * Initiates a checkout session for upgrading to Pro.
 *
 * @param request - The Next.js request object.
 * @param user - The user object containing id, role, and email.
 * @returns A JSON response with the checkout URL or an error message.
 */
export const checkout = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<NextResponse> => {
  if (!serverConfig.Stripe.proPriceId) {
    console.error('Stripe Pro Price ID is not configured');
    return NextResponse.json(
      { error: 'Missing Pro Price' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }

  const db = createDatabaseClient();

  const subscription = await db.subscription.findByUserId(user.id);

  if (!subscription || !subscription[0] || !subscription[0].customerId) {
    console.error('No active subscription found for user:', user.id);
    return NextResponse.json({ error: 'No subscription found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const billingService = createBillingService();

    const url = await billingService.manageSubscription(
      serverConfig.Stripe.proPriceId,
      subscription[0].customerId,
      `${serverConfig.baseURL}/dashboard/subscription`
    );

    if (!url) {
      console.error('Failed to create Billing Portal session');
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({ url }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error(
      'Error creating Billing Portal session',
      (error as { message?: string }).message ?? undefined
    );
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
