import { upgradeToPro } from './upgradeToPro';
import { NextRequest } from 'next/server';

const mockListCustomer = jest.fn();
const mockListSubscription = jest.fn();
const mockUpdateSubscription = jest.fn();

jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    listCustomer: mockListCustomer,
    listSubscription: mockListSubscription,
    updateSubscription: mockUpdateSubscription,
  }),
}));

let serverConfigStripeProPriceId: string | null = 'pro_123';
jest.mock('../../../../settings/settings', () => ({
  serverConfig: {
    get Stripe() {
      return {
        get proPriceId() {
          return serverConfigStripeProPriceId;
        },
      };
    },
  },
}));

describe('upgradeToPro API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  beforeEach(() => {
    jest.clearAllMocks();
    serverConfigStripeProPriceId = 'pro_123';
  });

  it('returns 404 if customer not found', async () => {
    mockListCustomer.mockResolvedValue([]);
    const res = await upgradeToPro({} as NextRequest, user);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Customer not found' });
  });

  it('returns 404 if subscription not found', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([]);
    const res = await upgradeToPro({} as NextRequest, user);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Subscription not found' });
  });

  it('returns 500 if proPriceId is not configured', async () => {
    serverConfigStripeProPriceId = null;
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([{ id: 'sub1', items: [{ id: 'item1' }] }]);
    const res = await upgradeToPro({} as NextRequest, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Pro price ID is not configured' });
  });

  it('returns clientSecret on success', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([{ id: 'sub1', items: [{ id: 'item1' }] }]);
    mockUpdateSubscription.mockResolvedValue('secret_abc');
    const res = await upgradeToPro({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: 'secret_abc' });
    expect(mockUpdateSubscription).toHaveBeenCalledWith('sub1', 'item1', 'pro_123');
  });

  it('returns 500 on error', async () => {
    mockListCustomer.mockRejectedValue(new Error('fail'));
    const res = await upgradeToPro({} as NextRequest, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
