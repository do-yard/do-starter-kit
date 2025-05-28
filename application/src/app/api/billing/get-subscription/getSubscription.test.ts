import { getSubscription } from './getSubscription';
import { NextRequest } from 'next/server';

const mockListCustomer = jest.fn();
const mockListSubscription = jest.fn();

jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    listCustomer: mockListCustomer,
    listSubscription: mockListSubscription,
  }),
}));

describe('getSubscription API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null if customer not found', async () => {
    mockListCustomer.mockResolvedValue([]);
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ subscription: null });
  });

  it('returns null if no subscriptions found', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([]);
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ subscription: null });
  });

  it('returns first subscription if found', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    const sub = { id: 'sub1', status: 'active' };
    mockListSubscription.mockResolvedValue([sub]);
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ subscription: sub });
  });

  it('returns 500 on error', async () => {
    mockListCustomer.mockRejectedValue(new Error('fail'));
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
