import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';

export const getSubscription = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const billingService = createBillingService();

    const customers = await billingService.listCustomer(user.email);

    if (customers.length === 0) {
      return NextResponse.json({ subscription: null });
    }

    const customerId = customers[0].id;

    const subscriptions = await billingService.listSubscription(customerId);

    return NextResponse.json({ subscription: subscriptions[0] || null });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
