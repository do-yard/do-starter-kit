import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';

export const createSubscription = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const billingService = createBillingService();

    const { priceId }: { priceId: string } = await request.json();

    const customers = await billingService.listCustomer(user.email);

    let customerId = customers[0].id;

    if (!customerId) {
      const customer = await billingService.createCustomer(user.email, {
        userId: user.email,
      });
      customerId = customer.id;
    }

    const { clientSecret } = await billingService.createSubscription(customerId, priceId);

    return NextResponse.json({ clientSecret });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
