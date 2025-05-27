import { auth } from 'lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';

export async function GET() {
  try {
    const session = await auth();
    const billingService = createBillingService();

    if (!session) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const customers = await billingService.listCustomer(session.user.email);

    if (customers.length === 0) {
      return NextResponse.json({ subscription: null });
    }

    const customerId = customers[0].id;

    const subscriptions = await billingService.listSubscription(customerId);

    const activeSub = subscriptions.find((s) => s.status === 'active');
    return NextResponse.json({ subscription: activeSub || null });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
