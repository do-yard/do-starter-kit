import { NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billing';

/**
 * Handles GET requests to fetch Stripe pricing plans and their details.
 */
export async function GET() {
  try {
    const billingService = createBillingService();
    const plans = await billingService.getProducts();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('[PRICING_API_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
