'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { StripeClient } from 'lib/api/stripe';

interface Plan {
  priceId: string;
  amount: number;
  interval: string;
  name: string;
  description: string;
  features: string[];
}

const client = new StripeClient();

/**
 * PricingPage displays available subscription plans and allows users to select one.
 */
export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    client
      .getProducts()
      .then((data) => setPlans(data))
      .catch((err) => console.error('Failed to load pricing data:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 6 }}>
      <Typography variant="h1" gutterBottom>
        Choose your Plan
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
            mt: 4,
          }}
        >
          {plans.map((plan) => (
            <Card key={plan.priceId} elevation={3} sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  ${plan.amount} / {plan.interval}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {plan.description}
                </Typography>
                <List>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index}>{feature}</ListItem>
                  ))}
                </List>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push('/login')}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
