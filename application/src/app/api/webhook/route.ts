/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { handleSubscriptionCreated } from './handleSubscriptionCreated';
import { handleSubscriptionUpdated } from './handleSubscriptionUpdated';
import { handleSubscriptionDeleted } from './handleSubscriptionDeleted';

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
 * Handles incoming webhook requests. Dummy Implementation
 *
 */
export async function POST(request: Request) {
  const json = await request.json();
  const handler = handlers[json.type as WebhookAcceptedEvents];
  if (handler) {
    try {
      console.log('Handling webhook event: ', json.type);
      await handler(json);
      return NextResponse.json({ status: 200 });
    } catch (error) {
      console.error('Error handling webhook:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  console.warn('Unhandled webhook event type:', json.type);
  return NextResponse.json({ status: 200 });
}
