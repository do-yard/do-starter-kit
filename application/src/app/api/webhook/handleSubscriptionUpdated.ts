/* eslint-disable  @typescript-eslint/no-explicit-any */
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { serverConfig } from '../../../../settings';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createEmailService } from 'services/email/emailFactory';
import { emailTemplate } from 'services/email/emailTemplate';

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

    const emailClient = await createEmailService();
    await emailClient.sendEmail(
      user.email,
      'Your subscription was updated',
      emailTemplate({
        title: 'Your subscription was updated',
        content: `<p style="text-align:center; margin: 32px 0;">Your subscription was updated.</p>
          <p style="text-align:center; margin: 32px 0;">
            Your subscription plan is now <strong>${plan}</strong>. Thank you for using our service!
          </p>`,
      })
    );

    console.log(`✅ Subscription updated and email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending subscription update email.', error);
  }
};
