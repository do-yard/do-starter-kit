'use client';

import { Typography, Box } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { StripeClient } from 'lib/api/stripe';
import { SubscriptionPlanEnum } from 'types';

/**
 * DashboardPageClient renders the dashboard UI and allows the user to send a test email to themselves.
 * @param userEmail - The email address of the logged-in user.
 */
export default function DashboardPageClient({ userEmail }: { userEmail: string }) {
  const [subscription, setSubscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const stripeApi = useMemo(() => new StripeClient(), []);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { subscription } = await stripeApi.getSubscription();
        // Set to plan name if found, else null
        setSubscription(subscription.length > 0 ? subscription[0].plan : null);
      } catch {
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [stripeApi]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Typography variant="h4">Welcome back, {userEmail}!</Typography>
      <Typography variant="body1" mt={2}>
        {loading ? (
          'Loading subscription...'
        ) : subscription === SubscriptionPlanEnum.FREE ? (
          <span
            style={{
              color: '#888',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
            }}
          >
            {subscription}
          </span>
        ) : subscription === SubscriptionPlanEnum.PRO ? (
          <span
            style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              background: 'linear-gradient(90deg, #ff512f, #dd2476, #1fa2ff, #12d8fa, #a6ffcb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}
          >
            {subscription}
          </span>
        ) : (
          `Your current subscription plan is: None`
        )}
      </Typography>
    </Box>
  );
}
