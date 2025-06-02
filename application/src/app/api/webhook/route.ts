/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { handleSubscriptionCreated } from './handleSubscriptionCreated';
import { handleSubscriptionUpdated } from './handleSubscriptionUpdated';
import { handleSubscriptionDeleted } from './handleSubscriptionDeleted';
import Stripe from 'stripe';
import { serverConfig } from 'settings/settings';

type WebhookAcceptedEvents =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

const handlers: { [key in WebhookAcceptedEvents]: (json: any) => Promise<void> } = {
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
};

/**
 * Handles incoming webhook requests form Stripe.
 *
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');

  if (!signature || signature === null) {
    console.error('Missing Stripe signature header');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  if (!serverConfig.Stripe.webhookSecret) {
    console.log('SECRET', serverConfig.Stripe.webhookSecret);
    console.error('Stripe webhook secret is not configured');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  let event;
  try {
    event = Stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      serverConfig.Stripe.webhookSecret
    );
  } catch (error) {
    console.error('Error constructing Stripe webhook event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  const handler = handlers[event?.type as WebhookAcceptedEvents];
  if (handler) {
    try {
      console.log('Handling webhook event: ', event?.type);
      await handler(event);
      return NextResponse.json({ status: 200 });
    } catch (error) {
      console.error('Error handling webhook:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  console.warn('Unhandled webhook event type:', event?.type);
  return NextResponse.json({ status: 200 });
}
