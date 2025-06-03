import { checkout } from './checkout';
import { NextRequest } from 'next/server';

const mockFindByUserId = jest.fn();
const mockCheckout = jest.fn();

jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    subscription: {
      findByUserId: mockFindByUserId,
    },
  }),
}));
jest.mock('services/billing/billing', () => ({
  createBillingService: () => ({
    checkout: mockCheckout,
  }),
}));

let proPriceId: string | undefined = 'pro_123';
let selfApiURL: string = 'http://localhost';
jest.mock('../../../../../settings', () => ({
  serverConfig: {
    Stripe: {
      get proPriceId() {
        return proPriceId;
      },
    },
    get selfApiURL() {
      return selfApiURL;
    },
  },
}));

describe('checkout', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  function mockNextRequest(body: any = {}) {
    return { json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest;
  }
  beforeEach(() => {
    jest.clearAllMocks();
    proPriceId = 'pro_123';
    selfApiURL = 'http://localhost';
  });

  it('returns 500 if proPriceId is not configured', async () => {
    proPriceId = undefined;
    const res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Missing Pro Price' });
  });

  it('returns 404 if no subscription or customerId', async () => {
    mockFindByUserId.mockResolvedValue(undefined);
    let res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'No subscription found' });

    mockFindByUserId.mockResolvedValue([]);
    res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'No subscription found' });

    mockFindByUserId.mockResolvedValue([{}]);
    res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'No subscription found' });

    mockFindByUserId.mockResolvedValue([{ customerId: null }]);
    res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'No subscription found' });
  });

  it('returns 500 if billingService.checkout fails', async () => {
    mockFindByUserId.mockResolvedValue([{ customerId: 'cust1' }]);
    mockCheckout.mockResolvedValue(undefined);
    const res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 200 and url on success', async () => {
    mockFindByUserId.mockResolvedValue([{ customerId: 'cust1' }]);
    mockCheckout.mockResolvedValue('http://checkout-url');
    const res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: 'http://checkout-url' });
  });
});
