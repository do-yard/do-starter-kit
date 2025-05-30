import { createDatabaseClient } from 'services/database/database';
import { SubscriptionStatusEnum } from 'types';

/**
 * Handles the creation of a subscription.
 * Updates the subscription status to ACTIVE in the database.
 *
 * @param json - The JSON payload from the webhook event.
 * @throws Will throw an error if customer ID is not provided.
 */
export const handleSubscriptionUpdated = async (json: any) => {
  const customerId = json.data.object.customer;

  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  const db = createDatabaseClient();

  db.subscription.updateByCustomerId(customerId, {
    status: SubscriptionStatusEnum.ACTIVE,
  });
};
