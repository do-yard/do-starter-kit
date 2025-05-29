'use client';

import { useEffect, useState } from 'react';
import { serverConfig } from 'settings/settings';
import StripeCheckout from './StripeCheckout';
import { StripeClient } from 'services/api/stripe';
import { SubscriptionPlan } from 'types';

const Subscription = () => {
  const [subscription, setSubscription] = useState<{
    id: string;
    status: string;
    plan: SubscriptionPlan;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const stripeApi = new StripeClient();

  const fetchSubscription = async () => {
    try {
      const { subscription } = await stripeApi.getSubscription();
      setSubscription(subscription);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Error loading subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await stripeApi.cancelSubscription();
      await fetchSubscription();
    } catch {
      setError('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    setUpgrading(true);
    try {
      const { clientSecret } = await stripeApi.updateToProSubscription();
      if (clientSecret) {
        window.location.reload();
      }
    } catch {
      setError('Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const basePlanId = serverConfig.Stripe.freePriceId;
  const proPlanId = serverConfig.Stripe.proPriceId;

  const currentPlan = subscription?.plan;

  const isBasePlan = currentPlan === 'FREE';
  const isProPlan = currentPlan === 'PRO';

  if (loading) return <p>Loading subscription data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subscription</h1>

      {subscription ? (
        <>
          <p>
            Subscription status: <strong>{subscription.status}</strong> (
            {isProPlan ? 'Pro Plan' : isBasePlan ? 'Free Plan' : 'Unknown Plan'})
          </p>

          {isBasePlan && (
            <button
              onClick={handleUpgradeToPro}
              disabled={upgrading}
              className="mt-4 bg-purple-500 text-white px-4 py-2 rounded"
            >
              {upgrading ? 'Upgrading...' : 'Upgrade to PRO'}
            </button>
          )}

          <button
            onClick={handleCancel}
            disabled={loading}
            className="mt-4 ml-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Cancel Subscription
          </button>
        </>
      ) : (
        <>
          <StripeCheckout
            priceId={basePlanId!}
            buttonText="Subscribe to Base Plan"
            onSubscribed={fetchSubscription}
          />
          <StripeCheckout
            priceId={proPlanId!}
            buttonText="Subscribe to Pro Plan"
            onSubscribed={fetchSubscription}
          />
        </>
      )}
    </div>
  );
};

export default Subscription;
