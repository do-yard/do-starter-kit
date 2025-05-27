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

    const customers = await billingService.listCustomer(session.user.email);

    if (customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customerId = customers[0].id;
    const subscriptions = await billingService.listSubscription(customerId);

    const sub = subscriptions.data[0];
    if (!sub) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    await billingService.cancelSubscription(sub.id);

    return NextResponse.json({ canceled: true });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
