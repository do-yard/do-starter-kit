import { getSubscription } from './getSubscription';
import { NextRequest } from 'next/server';

const mockFindByUserId = jest.fn();

jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    subscription: { findByUserId: mockFindByUserId },
  }),
}));

describe('getSubscription API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null if no subscription found', async () => {
    mockFindByUserId.mockResolvedValue(null);
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ subscription: null });
  });

  it('returns first subscription if found', async () => {
    const sub = { id: 'sub1', status: 'active', plan: 'PRO' };
    mockFindByUserId.mockResolvedValue(sub);
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ subscription: sub });
  });

  it('returns 500 on error', async () => {
    mockFindByUserId.mockRejectedValue(new Error('fail'));
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
