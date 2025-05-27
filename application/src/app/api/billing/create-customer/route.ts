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

    const customers = await billingService.listCustomer(session?.user.email);

    if (customers.length > 0) {
      return NextResponse.json({ customerId: customers[0].id });
    }

    const customer = await billingService.createCustomer(session?.user.email, {
      userId: session?.user.id,
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
