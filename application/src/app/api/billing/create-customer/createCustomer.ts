import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';

export const createCustomer = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const billingService = createBillingService();

    const customers = await billingService.listCustomer(user.email);

    if (customers.length > 0) {
      return NextResponse.json({ customerId: customers[0].id });
    }

    const customer = await billingService.createCustomer(user.email, {
      userId: user.email,
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
