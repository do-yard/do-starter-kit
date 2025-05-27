import { auth } from 'lib/auth';
import { NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';

export async function POST() {
  try {
    const session = await auth();
    const billingService = createBillingService();

    if (!session) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const customers = await billingService.listCustomer(session.user.email);

    if (customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customerId = customers[0].id;

    const subscriptions = await billingService.listSubscription(customerId);

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const subscription = subscriptions.data[0];

    const updatedSubscription = await billingService.updateSubscription(subscription.id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: process.env.NEXT_PUBLIC_PRO_PRICE_ID,
        },
      ],
      proration_behavior: 'always_invoice',
      payment_behavior: 'default_incomplete',
      // expand: ["latest_invoice.payment_intent"],
    });

    let paymentIntent: Stripe.PaymentIntent | undefined;
    if (
      updatedSubscription.latest_invoice &&
      typeof updatedSubscription.latest_invoice !== 'string' &&
      'payment_intent' in updatedSubscription.latest_invoice &&
      updatedSubscription.latest_invoice.payment_intent &&
      typeof updatedSubscription.latest_invoice.payment_intent !== 'string'
    ) {
      paymentIntent = updatedSubscription.latest_invoice.payment_intent as Stripe.PaymentIntent;
    }

    return NextResponse.json({ clientSecret: paymentIntent?.client_secret });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
