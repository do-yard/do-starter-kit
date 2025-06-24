/* eslint-disable  @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { serverConfig } from 'settings';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createEmailService } from 'services/email/emailFactory';
import { SubscriptionUpdatedEmail } from 'services/email/templates/SubscriptionUpdatedEmail';
import { createBillingService } from 'services/billing/billingFactory';

const PLAN_MAP: Record<string, SubscriptionPlanEnum> = {
  [serverConfig.Stripe.proPriceId!]: SubscriptionPlanEnum.PRO,
  [serverConfig.Stripe.freePriceId!]: SubscriptionPlanEnum.FREE,
};

/**
 * Handles the creation of a subscription.
 * Updates the subscription status to ACTIVE in the database.
 *
 * @param json - The JSON payload from the webhook event.
 * @throws Will throw an error if customer ID is not provided.
 */
export const handleSubscriptionUpdated = async (json: any) => {
  const customerId = json.data.object.customer;
  const priceId = json.data.object.items.data[0].price.id;

  if (!customerId || !priceId) {
    throw new Error(`Invalid event payload: missing ${!customerId ? 'customer' : 'price'} ID`);
  }

  const plan = PLAN_MAP[priceId];
  if (!plan) {
    console.warn(`⚠️ Ignoring unknown price ID: ${priceId}`);
    return;
  }

  const db = await createDatabaseService();

  const subscription = await db.subscription.updateByCustomerId(customerId, {
    status: SubscriptionStatusEnum.ACTIVE,
    plan,
  });

  try {
    const user = await db.user.findById(subscription.userId);

    if (!user) {
      console.warn(`⚠️ User not found for customer ID: ${subscription.userId}. Email not sent.`);
      return;
    }

    const billingService = await createBillingService();
    const plans = await billingService.getProducts();

    const currentPlan = plans.find((p) => p.priceId === priceId);

    if (!currentPlan) {
      console.warn(`⚠️ Plan not found for price ID: ${priceId}. Email not sent.`);
      return;
    }

    const emailClient = await createEmailService();

    if (emailClient.isEmailEnabled()) {
      // Use the new React email component for Resend
      await emailClient.sendReactEmail(
        user.email,
        'Your subscription was updated',
        <SubscriptionUpdatedEmail
          plan={{
            name: currentPlan.name,
            description: currentPlan.description,
            amount: currentPlan.amount,
            interval: currentPlan.interval,
            features: currentPlan.features,
            priceId: currentPlan.priceId,
          }}
        />
      );
    }

    console.log('✅ Subscription updated');
  } catch (error) {
    console.error('Error sending subscription update email.', error);
  }
};
