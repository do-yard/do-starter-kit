import { createCustomer } from './createCustomer';
import { NextRequest } from 'next/server';

const mockListCustomer = jest.fn();
const mockCreateCustomer = jest.fn();

jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    listCustomer: mockListCustomer,
    createCustomer: mockCreateCustomer,
  }),
}));

describe('createCustomer API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns existing customerId if customer exists', async () => {
    mockListCustomer.mockResolvedValue([{ id: 'cust1' }]);
    const res = await createCustomer({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ customerId: 'cust1' });
    expect(mockListCustomer).toHaveBeenCalledWith(user.email);
    expect(mockCreateCustomer).not.toHaveBeenCalled();
  });

  it('creates and returns new customerId if not found', async () => {
    mockListCustomer.mockResolvedValue([]);
    mockCreateCustomer.mockResolvedValue({ id: 'cust2' });
    const res = await createCustomer({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ customerId: 'cust2' });
    expect(mockListCustomer).toHaveBeenCalledWith(user.email);
    expect(mockCreateCustomer).toHaveBeenCalledWith(user.email, { userId: user.email });
  });

  it('returns 500 on error', async () => {
    mockListCustomer.mockRejectedValue(new Error('fail'));
    const res = await createCustomer({} as NextRequest, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
