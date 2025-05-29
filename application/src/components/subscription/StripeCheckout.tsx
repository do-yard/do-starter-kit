'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { StripeClient } from 'lib/api/stripe';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

type StripeCheckoutProps = {
  priceId: string;
  buttonText: string;
  onSubscribed: () => void;
};

const CheckoutForm = ({ onSubscribed }: { onSubscribed: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
    });

    if (result.error) {
      setError(result.error.message ?? 'Payment failed');
    } else {
      onSubscribed();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary">
          Complete Subscription
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </form>
  );
};

const StripeCheckout = ({ priceId, buttonText, onSubscribed }: StripeCheckoutProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const stripeApi = new StripeClient();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await stripeApi.createSubscription(priceId);
      const { clientSecret } = res;

      if (clientSecret) {
        setClientSecret(clientSecret);
        setShowForm(true);
      } else {
        onSubscribed();
      }
    } catch (err) {
      console.error('Subscription creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (showForm && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm onSubscribed={onSubscribed} />
      </Elements>
    );
  }

  return (
    <Button onClick={handleSubscribe} disabled={loading} variant="contained" color="success">
      {loading ? 'Processing...' : buttonText}
    </Button>
  );
};

export default StripeCheckout;
