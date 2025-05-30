import { createSubscription } from './createSubscription';
import { NextRequest } from 'next/server';

const mockListCustomer = jest.fn();
const mockCreateCustomer = jest.fn();
const mockCreateSubscription = jest.fn();
const mockDbCreate = jest.fn();
const mockDbUpdate = jest.fn();

jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    listCustomer: mockListCustomer,
    createCustomer: mockCreateCustomer,
    createSubscription: mockCreateSubscription,
  }),
}));
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    subscription: {
      create: mockDbCreate,
      update: mockDbUpdate,
    },
  }),
}));

describe('createSubscription API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  const priceId = 'price_123';
  function mockRequest(body: any): NextRequest {
    return { json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest;
  }
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if priceId is missing', async () => {
    const res = await createSubscription(mockRequest({}), user);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Price ID is required' });
  });

  it('uses existing customer and returns clientSecret, updates user in db', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_abc' });
    mockDbUpdate.mockResolvedValue({});
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: 'secret_abc' });
    expect(mockListCustomer).toHaveBeenCalledWith(user.email);
    expect(mockCreateCustomer).not.toHaveBeenCalled();
    expect(mockCreateSubscription).toHaveBeenCalledWith('cust1', priceId);
    expect(mockDbCreate).not.toHaveBeenCalled();
    expect(mockDbUpdate).toHaveBeenCalledWith(user.id, expect.any(Object));
  });

  it('creates customer if not found and returns clientSecret, creates user in db', async () => {
    mockListCustomer.mockResolvedValue([]);
    mockCreateCustomer.mockResolvedValue({ id: 'cust2' });
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_xyz' });
    mockDbCreate.mockResolvedValue({});
    mockDbUpdate.mockResolvedValue({});
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: 'secret_xyz' });
    expect(mockCreateCustomer).toHaveBeenCalledWith(user.email, { userId: user.email });
    expect(mockCreateSubscription).toHaveBeenCalledWith('cust2', priceId);
    expect(mockDbCreate).toHaveBeenCalledWith({
      customerId: 'cust2',
      plan: null,
      status: null,
      userId: 'u1',
    });
    expect(mockDbUpdate).toHaveBeenCalledWith(user.id, expect.any(Object));
  });

  it('returns 500 if db update fails after subscription', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_abc' });
    mockDbUpdate.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 on error from billing service', async () => {
    mockListCustomer.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 if createCustomer fails', async () => {
    mockListCustomer.mockResolvedValue([]);
    mockCreateCustomer.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 if createSubscription fails', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockCreateSubscription.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
