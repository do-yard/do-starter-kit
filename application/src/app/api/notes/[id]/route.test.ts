import { GET, PUT, DELETE } from './route';
import type { NextRequest } from 'next/server';

const mockFindById = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../../../services/database/database', () => ({
  createDatabaseClient: () => ({
    note: {
      findById: mockFindById,
      update: mockUpdate,
      delete: mockDelete,
    },
  }),
}));

const mockAuth = jest.fn();
jest.mock('../../../../lib/auth', () => ({
  auth: async () => mockAuth(),
}));

function createMockRequest(body: Record<string, unknown> = {}): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

function createParams(id: string) {
  return Promise.resolve({ id });
}

describe('notes/[id] API route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const res = await GET({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 if note not found', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindById.mockResolvedValue(null);
      const res = await GET({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Note not found' });
    });

    it('returns 403 if user does not own note', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindById.mockResolvedValue({ id: 'n1', userId: 'other', title: 't', content: 'c' });
      const res = await GET({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns note for owner', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      const note = { id: 'n1', userId: 'user1', title: 't', content: 'c' };
      mockFindById.mockResolvedValue(note);
      const res = await GET({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(note);
    });

    it('returns 500 on error', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindById.mockRejectedValue(new Error('fail'));
      const res = await GET({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Failed to fetch note' });
    });
  });

  describe('PUT', () => {
    it('returns 401 if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const res = await PUT(createMockRequest({ title: 't' }), { params: createParams('n1') });
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 if no fields provided', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      const res = await PUT(createMockRequest({}), { params: createParams('n1') });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error: 'At least one field (title or content) is required',
      });
    });

    it('returns 404 if note not found', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindById.mockResolvedValue(null);
      const res = await PUT(createMockRequest({ title: 't' }), { params: createParams('n1') });
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Note not found' });
    });

    it('returns 403 if user does not own note', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindById.mockResolvedValue({ id: 'n1', userId: 'other', title: 't', content: 'c' });
      const res = await PUT(createMockRequest({ title: 't' }), { params: createParams('n1') });
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('updates note for owner', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      const note = { id: 'n1', userId: 'user1', title: 't', content: 'c' };
      mockFindById.mockResolvedValue(note);
      mockUpdate.mockResolvedValue({ ...note, title: 'new' });
      const res = await PUT(createMockRequest({ title: 'new' }), { params: createParams('n1') });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ...note, title: 'new' });
    });

    it('returns 500 on error', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindById.mockResolvedValue({ id: 'n1', userId: 'user1', title: 't', content: 'c' });
      mockUpdate.mockRejectedValue(new Error('fail'));
      const res = await PUT(createMockRequest({ title: 'new' }), { params: createParams('n1') });
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Failed to update note' });
    });
  });

  describe('DELETE', () => {
    it('returns 401 if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const res = await DELETE({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 if note not found', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindById.mockResolvedValue(null);
      const res = await DELETE({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Note not found' });
    });

    it('returns 403 if user does not own note', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindById.mockResolvedValue({ id: 'n1', userId: 'other', title: 't', content: 'c' });
      const res = await DELETE({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('deletes note for owner', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      const note = { id: 'n1', userId: 'user1', title: 't', content: 'c' };
      mockFindById.mockResolvedValue(note);
      mockDelete.mockResolvedValue(undefined);
      const res = await DELETE({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it('returns 500 on error', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindById.mockResolvedValue({ id: 'n1', userId: 'user1', title: 't', content: 'c' });
      mockDelete.mockRejectedValue(new Error('fail'));
      const res = await DELETE({} as NextRequest, { params: createParams('n1') });
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Failed to delete note' });
    });
  });
});
