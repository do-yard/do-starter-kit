import { updateUser } from './updateUser';
import { NextRequest } from 'next/server';

jest.mock('services/database/databaseFactory', () => ({
  createDatabaseService: jest.fn(),
}));

import { createDatabaseService } from 'services/database/databaseFactory';

type MockDbClient = {
  user: {
    update: jest.Mock;
  };
  subscription: {
    findByUserId: jest.Mock;
    update: jest.Mock;
  };
};

describe('updateUser', () => {
  let mockDbClient: MockDbClient;

  beforeEach(() => {
    mockDbClient = {
      user: {
        update: jest.fn(),
      },
      subscription: {
        findByUserId: jest.fn(),
        update: jest.fn(),      },
    };
    (createDatabaseService as jest.Mock).mockResolvedValue(mockDbClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(body: Record<string, unknown>) {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  }

  it('returns 400 if no id is provided', async () => {
    const req = makeRequest({ name: 'Test' });
    const res = await updateUser(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: 'User ID is required' });
  });

  it('returns 400 if no valid fields to update', async () => {
    const req = makeRequest({ id: 1, notAllowed: 'foo' });
    const res = await updateUser(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: 'No valid fields to update' });
  });

  it('updates allowed fields and returns updated user', async () => {
    const updatedUser = { id: 1, name: 'New', role: 'ADMIN' };
    mockDbClient.user.update.mockResolvedValue(updatedUser);
    const req = makeRequest({ id: 1, name: 'New', role: 'ADMIN' });
    const res = await updateUser(req);
    expect(mockDbClient.user.update).toHaveBeenCalledWith(1, { name: 'New', role: 'ADMIN' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ user: updatedUser });
  });

  it('updates subscriptions if provided', async () => {
    const updatedUser = { id: 1, name: 'A', role: 'USER' };
    mockDbClient.user.update.mockResolvedValue(updatedUser);
    mockDbClient.subscription.findByUserId.mockResolvedValue([{ id: 10 }]);
    mockDbClient.subscription.update.mockResolvedValue({});
    const req = makeRequest({ id: 1, subscriptions: [{ plan: 'pro' }] });
    const res = await updateUser(req);
    expect(mockDbClient.subscription.findByUserId).toHaveBeenCalledWith(1);
    expect(mockDbClient.subscription.update).toHaveBeenCalledWith(10, { plan: 'pro' });
    expect(res.status).toBe(200);
  });

  it('returns 500 on server error', async () => {
    mockDbClient.user.update.mockRejectedValue(new Error('fail'));
    const req = makeRequest({ id: 1, name: 'X' });
    const res = await updateUser(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: 'Internal server error' });
  });
});
