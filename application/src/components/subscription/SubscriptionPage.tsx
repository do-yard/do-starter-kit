'use client';

import { useEffect, useState } from 'react';
import { serverConfig } from 'settings/settings';
import StripeCheckout from './StripeCheckout';
import { StripeClient } from 'lib/api/stripe';
import { SubscriptionPlan } from 'types';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Main component for managing user subscriptions.
 *
 * @returns Subscription component that displays the user's subscription status and allows them to manage their subscription.
 */
const Subscription = () => {
  const [subscription, setSubscription] = useState<{
    id: string | null;
    status: string | null;
    plan: SubscriptionPlan | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const stripeApi = new StripeClient();

  const fetchSubscription = async () => {
    try {
      const { subscription } = await stripeApi.getSubscription();
      setSubscription(subscription[0]);
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
      await stripeApi.updateToProSubscription();
      await fetchSubscription();
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

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Subscription
      </Typography>

      {subscription?.plan && subscription?.status && subscription.status !== 'CANCELED' ? (
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Typography mb={2}>
            Subscription status: <strong>{subscription.status}</strong> (
            {isProPlan ? 'Pro Plan' : isBasePlan ? 'Free Plan' : 'No Plan'})
          </Typography>

          {isBasePlan && (
            <Button
              onClick={handleUpgradeToPro}
              disabled={upgrading}
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              {upgrading ? 'Upgrading...' : 'Upgrade to PRO'}
            </Button>
          )}

          <Button
            onClick={handleCancel}
            disabled={loading}
            variant="contained"
            color="error"
            sx={{ mt: 2 }}
          >
            Cancel Subscription
          </Button>
        </Box>
      ) : (
        <Box display={'flex'} flexDirection="column" alignItems="flex-start" mt={2}>
          <StripeCheckout
            priceId={basePlanId!}
            buttonText="Subscribe to Base Plan"
            onSubscribed={fetchSubscription}
          />
          <Box mt={2}>
            <StripeCheckout
              priceId={proPlanId!}
              buttonText="Subscribe to Pro Plan"
              onSubscribed={fetchSubscription}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Subscription;
