import { createCustomer } from './createCustomer';
import { NextRequest } from 'next/server';

const mockListCustomer = jest.fn();
const mockCreateCustomer = jest.fn();
const mockDbCreate = jest.fn();

jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    listCustomer: mockListCustomer,
    createCustomer: mockCreateCustomer,
  }),
}));
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    subscription: {
      create: mockDbCreate,
    },
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
    mockDbCreate.mockResolvedValue({});
    const res = await createCustomer({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ customerId: 'cust2' });
    expect(mockListCustomer).toHaveBeenCalledWith(user.email);
    expect(mockCreateCustomer).toHaveBeenCalledWith(user.email, { userId: user.email });
    expect(mockDbCreate).toHaveBeenCalledWith({
      customerId: 'cust2',
      plan: null,
      status: null,
      userId: 'u1',
    });
  });

  it('returns 500 on error from listCustomer', async () => {
    mockListCustomer.mockRejectedValue(new Error('fail'));
    const res = await createCustomer({} as NextRequest, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 on error from createCustomer', async () => {
    mockListCustomer.mockResolvedValue([]);
    mockCreateCustomer.mockRejectedValue(new Error('fail'));
    const res = await createCustomer({} as NextRequest, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
