import { POST } from './route';
import { NextRequest } from 'next/server';

const mockHandleSubscriptionCreated = jest.fn();
const mockHandleSubscriptionUpdated = jest.fn();
const mockHandleSubscriptionDeleted = jest.fn();

jest.mock('./handleSubscriptionCreated', () => ({
  handleSubscriptionCreated: () => mockHandleSubscriptionCreated(),
}));
jest.mock('./handleSubscriptionUpdated', () => ({
  handleSubscriptionUpdated: () => mockHandleSubscriptionUpdated(),
}));
jest.mock('./handleSubscriptionDeleted', () => ({
  handleSubscriptionDeleted: () => mockHandleSubscriptionDeleted(),
}));

const mockConstructEvent = jest.fn();
jest.mock('stripe', () => {
  return {
    webhooks: {
      constructEvent: (...args: any[]) => mockConstructEvent(...args),
    },
  };
});

let secret: string | undefined = 'whsec_test';

jest.mock('../../../settings/settings', () => ({
  serverConfig: {
    Stripe: {
      get webhookSecret() {
        return secret;
      },
    },
  },
}));

function mockNextRequest({
  headers = {},
  body = '',
}: {
  headers?: Record<string, string | null>;
  body?: string;
}) {
  return {
    headers: {
      get: (key: string) => headers[key],
    },
    text: async () => body,
  } as unknown as NextRequest;
}

describe('webhook route POST', () => {
  const stripeSignature = 'test-signature';
  const baseHeaders = { 'stripe-signature': stripeSignature };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 500 if signature is missing', async () => {
    const req = mockNextRequest({ headers: { 'stripe-signature': null } });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('returns 500 if webhookSecret is not configured', async () => {
    secret = undefined;
    const req = mockNextRequest({ headers: baseHeaders });
    const res = await POST(req);
    expect(res.status).toBe(500);
    secret = 'whsec_test'; // reset for other tests
  });

  it('returns 500 if Stripe.webhooks.constructEvent throws', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('fail');
    });
    const req = mockNextRequest({ headers: baseHeaders, body: 'body' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('calls handleSubscriptionCreated for created event', async () => {
    mockConstructEvent.mockReturnValue({ type: 'customer.subscription.created' });
    const req = mockNextRequest({ headers: baseHeaders, body: 'body' });
    const res = await POST(req);
    expect(mockHandleSubscriptionCreated).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('calls handleSubscriptionUpdated for updated event', async () => {
    mockConstructEvent.mockReturnValue({ type: 'customer.subscription.updated' });
    const req = mockNextRequest({ headers: baseHeaders, body: 'body' });
    const res = await POST(req);
    expect(mockHandleSubscriptionUpdated).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('calls handleSubscriptionDeleted for deleted event', async () => {
    mockConstructEvent.mockReturnValue({ type: 'customer.subscription.deleted' });
    const req = mockNextRequest({ headers: baseHeaders, body: 'body' });
    const res = await POST(req);
    expect(mockHandleSubscriptionDeleted).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('returns 200 for unhandled event type', async () => {
    mockConstructEvent.mockReturnValue({ type: 'unhandled.event' });
    const req = mockNextRequest({ headers: baseHeaders, body: 'body' });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 500 if handler throws', async () => {
    mockConstructEvent.mockReturnValue({ type: 'customer.subscription.created' });
    mockHandleSubscriptionCreated.mockRejectedValue(new Error('fail'));
    const req = mockNextRequest({ headers: baseHeaders, body: 'body' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
