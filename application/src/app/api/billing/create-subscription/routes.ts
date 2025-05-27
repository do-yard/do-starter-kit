import { auth } from 'lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const billingService = createBillingService();

    if (!session) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const { priceId }: { priceId: string } = await req.json();

    const customers = await billingService.listCustomer(session.user.email);

    let customerId = customers[0].id;

    if (!customerId) {
      const customer = await billingService.createCustomer(session?.user.email, {
        userId: session?.user.id,
      });
      customerId = customer.id;
    }

    const subscription = await billingService.createSubscription(customerId, priceId);

    let paymentIntent: Stripe.PaymentIntent | undefined;
    if (
      subscription.latest_invoice &&
      typeof subscription.latest_invoice !== 'string' &&
      'payment_intent' in subscription.latest_invoice &&
      subscription.latest_invoice.payment_intent &&
      typeof subscription.latest_invoice.payment_intent !== 'string'
    ) {
      paymentIntent = subscription.latest_invoice.payment_intent as Stripe.PaymentIntent;
    }

    return NextResponse.json({ clientSecret: paymentIntent?.client_secret });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
