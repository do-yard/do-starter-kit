import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';
import { createDatabaseClient } from 'services/database/database';
import { SubscriptionPlanEnum } from 'types';
import { serverConfig } from '../../../../settings';
/**
 * Function to update subscriptions
 * @param sub subscription data
 * @param id user id
 * @returns void or NextResponse in case of error
 */
const updateSubscription = async (sub: any, id: string) => {
  const billing = createBillingService();
  const dbClient = createDatabaseClient();

  if (sub.plan === SubscriptionPlanEnum.PRO) {
    console.log('PRO');
    if (!serverConfig.Stripe.proGiftPriceId) {
      return NextResponse.json({ error: 'Pro gift price ID is not configured' }, { status: 500 });
    }
    const existingSubscription = await dbClient.subscription.findByUserId(id);

    if (
      !existingSubscription ||
      !existingSubscription.length ||
      !existingSubscription[0].customerId
    ) {
      return NextResponse.json(
        { error: 'No existing subscription found for user' },
        { status: 404 }
      );
    }

    const existingStripeSubscription = await billing.listSubscription(
      existingSubscription[0].customerId
    );

    await billing.updateSubscription(
      existingStripeSubscription[0].id,
      existingStripeSubscription[0].items[0].id,
      serverConfig.Stripe.proGiftPriceId
    );
  }

  if (sub.plan === SubscriptionPlanEnum.FREE) {
    console.log('FREE');
    if (!serverConfig.Stripe.freePriceId) {
      return NextResponse.json({ error: 'Free price ID is not configured' }, { status: 500 });
    }
    const existingSubscription = await dbClient.subscription.findByUserId(id);

    if (
      !existingSubscription ||
      !existingSubscription.length ||
      !existingSubscription[0].customerId
    ) {
      return NextResponse.json(
        { error: 'No existing subscription found for user' },
        { status: 404 }
      );
    }

    const existingStripeSubscription = await billing.listSubscription(
      existingSubscription[0].customerId
    );

    await billing.updateSubscription(
      existingStripeSubscription[0].id,
      existingStripeSubscription[0].items[0].id,
      serverConfig.Stripe.freePriceId
    );
  }

  await dbClient.subscription.update(id, sub);
};

/**
 * Updates a user with the provided data in the request body.
 * Only allows updating specific fields: name, role, and subscriptions.
 *
 * @param request - The Next.js request object containing user update data.
 * @returns A NextResponse with the updated user or an error message.
 */
export const updateUser = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Only allow updating specific fields (e.g., name, email, role)
    const allowedFields = ['name', 'role', 'subscription'];

    // Remove fields from updateData that are not allowed
    Object.keys(updateData).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const dbClient = createDatabaseClient();
    const updatedUser = await dbClient.user.update(id, {
      name: updateData.name,
      role: updateData.role,
    });

    if (updateData.subscription) {
      console.log('EXIST SUBSCRIPTION DATA', updateData.subscription);
      await updateSubscription(updateData.subscription, id);
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
