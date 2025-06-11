import { HTTP_STATUS } from 'lib/api/http';
import { cancelSubscription } from './cancelSubscription';
import { NextRequest } from 'next/server';

const mockListCustomer = jest.fn();
const mockListSubscription = jest.fn();
const mockCancelSubscription = jest.fn();
const mockUpdateSubscription = jest.fn();
const mockFindByUserId = jest.fn();
const mockStripeUpdateSubscription = jest.fn();

jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    listCustomer: mockListCustomer,
    listSubscription: mockListSubscription,
    cancelSubscription: mockCancelSubscription,
    updateSubscription: mockStripeUpdateSubscription,
  }),
}));
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    subscription: {
      update: mockUpdateSubscription,
      findByUserId: mockFindByUserId,
    },
  }),
}));
jest.mock('../../../../../settings', () => ({
  serverConfig: {
    Stripe: { freePriceId: 'free_price_id' },
  },
}));

describe('cancelSubscription API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 if customer not found', async () => {
    mockListCustomer.mockResolvedValue([]);
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await res.json()).toEqual({ error: 'Customer not found' });
  });

  it('returns 404 if no active subscription from billing', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([]);
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await res.json()).toEqual({ error: 'No active subscription' });
  });

  it('returns 404 if no db subscription found', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([{ id: 'sub1', items: [{ id: 'item1' }] }]);
    mockFindByUserId.mockResolvedValue([]);
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await res.json()).toEqual({ error: 'No active subscription found' });
  });

  it('downgrades subscription to FREE and returns canceled', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([{ id: 'sub1', items: [{ id: 'item1' }] }]);
    mockFindByUserId.mockResolvedValue([{ plan: 'PRO' }]);
    mockStripeUpdateSubscription.mockResolvedValue(undefined);
    mockUpdateSubscription.mockResolvedValue({});
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ canceled: true });
    expect(mockStripeUpdateSubscription).toHaveBeenCalledWith('sub1', 'item1', 'free_price_id');
    expect(mockUpdateSubscription).toHaveBeenCalledWith('u1', { plan: 'FREE', status: 'PENDING' });
  });

  it('returns 500 if db update fails', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([{ id: 'sub1', items: [{ id: 'item1' }] }]);
    mockFindByUserId.mockResolvedValue([{ plan: 'FREE' }]);
    mockCancelSubscription.mockResolvedValue(undefined);
    mockUpdateSubscription.mockRejectedValue(new Error('fail'));
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 on error from billing service', async () => {
    mockListCustomer.mockRejectedValue(new Error('fail'));
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 if cancelSubscription fails', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([{ id: 'sub1', items: [{ id: 'item1' }] }]);
    mockFindByUserId.mockResolvedValue([{ plan: 'FREE' }]);
    mockCancelSubscription.mockRejectedValue(new Error('fail'));
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
