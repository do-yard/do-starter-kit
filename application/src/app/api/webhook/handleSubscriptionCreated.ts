/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createDatabaseClient } from 'services/database/database';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { serverConfig } from '../../../../settings';

/**
 * Handles the creation of a subscription.
 * Updates the subscription status to ACTIVE in the database.
 *
 * @param json - The JSON payload from the webhook event.
 * @throws Will throw an error if customer ID is not provided.
 */
export const handleSubscriptionCreated = async (json: any) => {
  const customerId = json.data.object.customer;
  const priceId = json.data.object.items.data[0].price.id;

  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  const db = createDatabaseClient();

  if (priceId === serverConfig.Stripe.proPriceId) {
    await db.subscription.updateByCustomerId(customerId, {
      status: SubscriptionStatusEnum.ACTIVE,
      plan: SubscriptionPlanEnum.PRO,
    });
    return;
  }

  await db.subscription.updateByCustomerId(customerId, {
    status: SubscriptionStatusEnum.ACTIVE,
  });
};
