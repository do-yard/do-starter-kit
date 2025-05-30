import { createDatabaseClient } from 'services/database/database';
import { SubscriptionStatusEnum } from 'types';

export const handleSubscriptionCreated = async (json: any) => {
  const customerId = json.data.object.customer;

  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  const db = createDatabaseClient();

  db.subscription.updateByCustomerId(customerId, {
    status: SubscriptionStatusEnum.ACTIVE,
  });
};
