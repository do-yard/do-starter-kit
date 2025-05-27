import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';

// Mocks
const mockAuth = jest.fn();
jest.mock('../../../lib/auth', () => ({
  auth: async () => mockAuth(),
}));

const mockFindAll = jest.fn();
const mockUpdate = jest.fn();
const mockFindByUserId = jest.fn();
const mockUpdateSubscription = jest.fn();
jest.mock('../../../services/database/database', () => ({
  createDatabaseClient: () => ({
    user: {
      findAll: mockFindAll,
      update: mockUpdate,
    },
    subscription: {
      findByUserId: mockFindByUserId,
      update: mockUpdateSubscription,
    },
  }),
}));

describe('GET /api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = { url: 'http://localhost/api/users' } as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('returns 403 if not admin', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: '1', role: 'USER' } });
    const req = { url: 'http://localhost/api/users' } as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json).toEqual({ error: 'Forbidden' });
  });

  it('returns users and total for admin', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: '1', role: 'ADMIN' } });
    mockFindAll.mockResolvedValueOnce({ users: [{ id: 'u1' }], total: 1 });
    const req = { url: 'http://localhost/api/users?page=1&pageSize=10' } as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ users: [{ id: 'u1' }], total: 1 });
    expect(mockFindAll).toHaveBeenCalledWith({ page: 1, pageSize: 10, searchName: undefined, filterPlan: undefined, filterStatus: undefined });
  });

  it('returns 500 on error', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: '1', role: 'ADMIN' } });
    mockFindAll.mockRejectedValueOnce(new Error('fail'));
    const req = { url: 'http://localhost/api/users' } as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: 'Internal server error' });
  });
});

describe('PATCH /api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = { json: async () => ({ id: 'u1', name: 'n' }) } as unknown as NextRequest;
    const res = await PATCH(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('returns 403 if not admin', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: '1', role: 'USER' } });
    const req = { json: async () => ({ id: 'u1', name: 'n' }) } as unknown as NextRequest;
    const res = await PATCH(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json).toEqual({ error: 'Forbidden' });
  });

  it('returns 400 if no id', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: '1', role: 'ADMIN' } });
    const req = { json: async () => ({ name: 'n' }) } as unknown as NextRequest;
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: 'User ID is required' });
  });

  it('returns 400 if no valid fields', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: '1', role: 'ADMIN' } });
    const req = { json: async () => ({ id: 'u1', foo: 'bar' }) } as unknown as NextRequest;
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: 'No valid fields to update' });
  });

  it('updates user and subscription if provided', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: '1', role: 'ADMIN' } });
    mockUpdate.mockResolvedValueOnce({ id: 'u1', name: 'n', role: 'USER' });
    mockFindByUserId.mockResolvedValueOnce([{ id: 'sub1' }]);
    mockUpdateSubscription.mockResolvedValueOnce({});
    const req = { json: async () => ({ id: 'u1', name: 'n', role: 'USER', subscriptions: [{ plan: 'PRO', status: 'ACTIVE' }] }) } as unknown as NextRequest;
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ user: { id: 'u1', name: 'n', role: 'USER' } });
    expect(mockUpdate).toHaveBeenCalledWith('u1', { name: 'n', role: 'USER' });
    expect(mockFindByUserId).toHaveBeenCalledWith('u1');
    expect(mockUpdateSubscription).toHaveBeenCalledWith('sub1', { plan: 'PRO', status: 'ACTIVE' });
  });

  it('updates user only if no subscriptions', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: '1', role: 'ADMIN' } });
    mockUpdate.mockResolvedValueOnce({ id: 'u1', name: 'n', role: 'USER' });
    const req = { json: async () => ({ id: 'u1', name: 'n', role: 'USER' }) } as unknown as NextRequest;
    const res = await PATCH(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({ user: { id: 'u1', name: 'n', role: 'USER' } });
    expect(mockUpdate).toHaveBeenCalledWith('u1', { name: 'n', role: 'USER' });
  });

  it('returns 500 on error', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: '1', role: 'ADMIN' } });
    mockUpdate.mockRejectedValueOnce(new Error('fail'));
    const req = { json: async () => ({ id: 'u1', name: 'n', role: 'USER' }) } as unknown as NextRequest;
    const res = await PATCH(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: 'Internal server error' });
  });
});
