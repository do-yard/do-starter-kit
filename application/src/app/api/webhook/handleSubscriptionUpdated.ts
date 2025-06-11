/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createDatabaseClient } from 'services/database/database';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { serverConfig } from '../../../../settings';

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

  const db = createDatabaseClient();

  await db.subscription.updateByCustomerId(customerId, {
    status: SubscriptionStatusEnum.ACTIVE,
    plan,
  });
};
