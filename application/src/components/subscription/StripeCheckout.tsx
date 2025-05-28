'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { StripeClient } from 'services/api/stripe';

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
      <button type="submit" className="ml-4 mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Complete Subscription
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
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
        console.log('Client secret received:', clientSecret);
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
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="bg-green-600 text-white px-4 py-2 rounded"
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  );
};

export default StripeCheckout;
