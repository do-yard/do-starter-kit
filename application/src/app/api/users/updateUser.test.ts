import { USER_ROLES } from 'lib/auth/roles';
import { updateUser } from './updateUser';
import { NextRequest } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';

const mockUpdate = jest.fn();
const mockFindByUserId = jest.fn();
const mockSubUpdate = jest.fn();
const mockDbClient = {
  user: {
    update: mockUpdate,
  },
  subscription: {
    findByUserId: mockFindByUserId,
    update: mockSubUpdate,
  },
};

jest.mock('../../../services/database/databaseFactory', () => ({
  createDatabaseService: () => Promise.resolve(mockDbClient),
}));

describe('updateUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const json = await res.json();
    expect(json).toEqual({ error: 'User ID is required' });
  });

  it('returns 400 if no valid fields to update', async () => {
    const req = makeRequest({ id: 1, notAllowed: 'foo' });
    const res = await updateUser(req);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const json = await res.json();
    expect(json).toEqual({ error: 'No valid fields to update' });
  });

  it('updates allowed fields and returns updated user', async () => {
    const updatedUser = { id: 1, name: 'New', role: USER_ROLES.ADMIN };
    mockUpdate.mockResolvedValue(updatedUser);
    const req = makeRequest({ id: 1, name: 'New', role: USER_ROLES.ADMIN });
    const res = await updateUser(req);
    expect(mockUpdate).toHaveBeenCalledWith(1, {
      name: 'New',
      role: USER_ROLES.ADMIN,
    });
    expect(res.status).toBe(HTTP_STATUS.OK);
    const json = await res.json();
    expect(json).toEqual({ user: updatedUser });
  });

  it('updates subscriptions if provided', async () => {
    const updatedUser = { id: 1, name: 'A', role: USER_ROLES.USER };
    mockUpdate.mockResolvedValue(updatedUser);
    mockFindByUserId.mockResolvedValue([{ id: 10 }]);
    mockSubUpdate.mockResolvedValue({});
    const req = makeRequest({ id: 1, subscriptions: [{ plan: 'pro' }] });
    const res = await updateUser(req);
    expect(mockFindByUserId).toHaveBeenCalledWith(1);
    expect(mockSubUpdate).toHaveBeenCalledWith(10, { plan: 'pro' });
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('returns 500 on server error', async () => {
    mockUpdate.mockRejectedValue(new Error('fail'));
    const req = makeRequest({ id: 1, name: 'X' });
    const res = await updateUser(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const json = await res.json();
    expect(json).toEqual({ error: 'Internal server error' });
  });
});
