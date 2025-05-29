import { createSubscription } from './createSubscription';
import { NextRequest } from 'next/server';

const mockListCustomer = jest.fn();
const mockCreateCustomer = jest.fn();
const mockCreateSubscription = jest.fn();
const mockCreateUser = jest.fn();

jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    listCustomer: mockListCustomer,
    createCustomer: mockCreateCustomer,
    createSubscription: mockCreateSubscription,
  }),
}));
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    subscription: { create: mockCreateUser },
  }),
}));

type RequestBody = { priceId: string };
function mockRequest(body: RequestBody): NextRequest {
  return { json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest;
}

describe('createSubscription API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  const priceId = 'price_123';
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses existing customer and returns clientSecret, updates user in db', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_abc' });
    mockCreateUser.mockResolvedValue({});
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: 'secret_abc' });
    expect(mockListCustomer).toHaveBeenCalledWith(user.email);
    expect(mockCreateCustomer).not.toHaveBeenCalled();
    expect(mockCreateSubscription).toHaveBeenCalledWith('cust1', priceId);
    expect(mockCreateUser).toHaveBeenCalledWith({ plan: 'FREE', status: 'ACTIVE', userId: 'u1' });
  });

  it('creates customer if not found and returns clientSecret, updates user in db', async () => {
    mockListCustomer.mockResolvedValue([{}]);
    mockCreateCustomer.mockResolvedValue({ id: 'cust2' });
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_xyz' });
    mockCreateUser.mockResolvedValue({});
    // Simulate no id in first customer
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: 'secret_xyz' });
    expect(mockCreateCustomer).toHaveBeenCalledWith(user.email, { userId: user.email });
    expect(mockCreateSubscription).toHaveBeenCalledWith('cust2', priceId);
    expect(mockCreateUser).toHaveBeenCalledWith({ plan: 'FREE', status: 'ACTIVE', userId: 'u1' });
  });

  it('returns 500 if db update fails', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_abc' });
    mockCreateUser.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 on error', async () => {
    mockListCustomer.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
