import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';
import { SubscriptionStatusEnum } from 'types';

/**
 * Fetches the active subscription for a user.
 *
 * @param user - The user object containing id and role and email.
 */
export const getSubscription = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const db = createDatabaseClient();
    const subscription = await db.subscription.findByUserAndStatus(
      user.id,
      SubscriptionStatusEnum.ACTIVE
    );

    return NextResponse.json({ subscription: subscription });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
