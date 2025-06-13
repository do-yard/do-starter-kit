/* eslint-disable  @typescript-eslint/no-explicit-any */
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { serverConfig } from '../../../../settings';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createEmailService } from 'services/email/emailFactory';
import { emailTemplate } from 'services/email/emailTemplate';
import { createBillingService } from 'services/billing/billing';

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

    const billingService = createBillingService();
    const plans = await billingService.getProducts();

    const currentPlan = plans.find((p) => p.priceId === priceId);

    const emailClient = await createEmailService();
    await emailClient.sendEmail(
      user.email,
      'Your subscription was updated',
      emailTemplate({
        title: 'Your subscription was updated',
        content: `<p style="text-align:center; margin: 32px 0;">
            Your subscription plan was updated to <strong>${plan}</strong> plan. Thank you for using our service!
          </p>
          ${
            currentPlan
              ? `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:400px;margin:24px auto 0 auto;padding:0;background:#f4f8ff;border:1px solid #dbeafe;border-radius:8px;box-shadow:0 2px 8px #e0e7ef;">
            <tr>
              <td style="padding: 24px 20px 12px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td colspan="2" style="font-size:1.2rem;color:#0061EB;font-weight:bold;padding-bottom:12px;">Plan Details</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold;padding:4px 0;width:100px;">Name:</td>
                    <td style="padding:4px 0;">${currentPlan.name}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold;padding:4px 0;">Description:</td>
                    <td style="padding:4px 0;">${currentPlan.description}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold;padding:4px 0;">Price:</td>
                    <td style="padding:4px 0;">$${currentPlan.amount} / ${currentPlan.interval ?? 'one-time'}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold;padding:4px 0;vertical-align:top;">Features:</td>
                    <td style="padding:4px 0;">
                      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                        ${(currentPlan.features || []).map((f) => `<tr><td style='padding:2px 0;'>• ${f}</td></tr>`).join('')}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:12px;color:#888;padding-top:8px;">Price ID:</td>
                    <td style="font-size:12px;color:#888;padding-top:8px;">${currentPlan.priceId}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          `
              : ''
          }
        `,
      })
    );

    console.log(`✅ Subscription updated and email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending subscription update email.', error);
  }
};
