import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';
import { createDatabaseClient } from 'services/database/database';
import { SubscriptionPlanEnum } from 'types';
import { serverConfig } from '../../../../settings';
import { HTTP_STATUS } from 'lib/api/http';

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
    if (!serverConfig.Stripe.proGiftPriceId) {
      throw new Error('Pro gift price ID is not configured');
    }
    const existingSubscription = await dbClient.subscription.findByUserId(id);
    if (
      !existingSubscription ||
      !existingSubscription.length ||
      !existingSubscription[0].customerId
    ) {
      console.error('No existing subscription found for user');
      throw new Error('No existing subscription found for user');
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
    if (!serverConfig.Stripe.freePriceId) {
      console.error('Free price ID is not configured');
      throw new Error('Free price ID is not configured');
    }
    const existingSubscription = await dbClient.subscription.findByUserId(id);

    if (
      !existingSubscription ||
      !existingSubscription.length ||
      !existingSubscription[0].customerId
    ) {
      console.error('No existing subscription found for user');
      throw new Error('No existing subscription found for user');
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
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
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
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const dbClient = createDatabaseClient();
    const updatedUser = await dbClient.user.update(id, {
      name: updateData.name,
      role: updateData.role,
    });

    if (updateData.subscription) {
      try {
        await updateSubscription(updateData.subscription, id);
      } catch (error) {
        return NextResponse.json(
          { error: (error as Error).message },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
