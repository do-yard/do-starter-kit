import { cancelSubscription } from './cancelSubscription';
import { NextRequest } from 'next/server';

const mockListCustomer = jest.fn();
const mockListSubscription = jest.fn();
const mockCancelSubscription = jest.fn();
const mockUpdate = jest.fn();
const mockFindByUserAndStatus = jest.fn();

jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    listCustomer: mockListCustomer,
    listSubscription: mockListSubscription,
    cancelSubscription: mockCancelSubscription,
  }),
}));
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    subscription: {
      update: mockUpdate,
      findByUserAndStatus: mockFindByUserAndStatus,
    },
  }),
}));

describe('cancelSubscription API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 if customer not found', async () => {
    mockListCustomer.mockResolvedValue([]);
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Customer not found' });
  });

  it('returns 400 if no active subscription', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([]);
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'No active subscription' });
  });

  it('returns { canceled: true } on success and updates user in db', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([{ id: 'sub1' }]);
    mockCancelSubscription.mockResolvedValue(undefined);
    mockFindByUserAndStatus.mockResolvedValue({ id: 'test' });
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ canceled: true });
    expect(mockCancelSubscription).toHaveBeenCalledWith('sub1');
    expect(mockFindByUserAndStatus).toHaveBeenCalledWith('u1', 'ACTIVE');
  });

  it('returns 500 if db update fails', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([{ id: 'sub1' }]);
    mockCancelSubscription.mockResolvedValue(undefined);
    mockFindByUserAndStatus.mockRejectedValue(new Error('fail'));
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 on error', async () => {
    mockListCustomer.mockRejectedValue(new Error('fail'));
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 400 if no subscription found in db', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockListSubscription.mockResolvedValue([{ id: 'sub1' }]);
    mockCancelSubscription.mockResolvedValue(undefined);
    mockFindByUserAndStatus.mockResolvedValue(null); // Simulate no subscription in DB
    const res = await cancelSubscription({} as NextRequest, user);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Active subscription not found in database' });
  });
});
