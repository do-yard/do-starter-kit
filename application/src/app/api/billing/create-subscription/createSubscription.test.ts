import { createSubscription } from './createSubscription';
import { NextRequest } from 'next/server';

const mockListCustomer = jest.fn();
const mockCreateCustomer = jest.fn();
const mockCreateSubscription = jest.fn();

jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    listCustomer: mockListCustomer,
    createCustomer: mockCreateCustomer,
    createSubscription: mockCreateSubscription,
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

  it('uses existing customer and returns clientSecret', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_abc' });
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: 'secret_abc' });
    expect(mockListCustomer).toHaveBeenCalledWith(user.email);
    expect(mockCreateCustomer).not.toHaveBeenCalled();
    expect(mockCreateSubscription).toHaveBeenCalledWith('cust1', priceId);
  });

  it('creates customer if not found and returns clientSecret', async () => {
    mockListCustomer.mockResolvedValue([{}]);
    mockCreateCustomer.mockResolvedValue({ id: 'cust2' });
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_xyz' });
    // Simulate no id in first customer
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: 'secret_xyz' });
    expect(mockCreateCustomer).toHaveBeenCalledWith(user.email, { userId: user.email });
    expect(mockCreateSubscription).toHaveBeenCalledWith('cust2', priceId);
  });

  it('returns 500 on error', async () => {
    mockListCustomer.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ priceId }), user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
