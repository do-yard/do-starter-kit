import { GET, POST } from './route';
import type { NextRequest } from 'next/server';

const mockFindByUserId = jest.fn();
const mockCreate = jest.fn();
jest.mock('../../../services/database/database', () => ({
  createDatabaseClient: () => ({
    note: {
      findByUserId: mockFindByUserId,
      create: mockCreate,
    },
  }),
}));
// Mock auth
const mockAuth = jest.fn();
jest.mock('../../../lib/auth', () => ({
  auth: async () => mockAuth(),
}));

function createMockRequest(body: Record<string, unknown>): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('notes API route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns notes for authenticated user', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      const notes = [{ id: 'n1', title: 't', content: 'c' }];
      mockFindByUserId.mockResolvedValue(notes);
      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual(notes);
    });

    it('returns 500 on error', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockFindByUserId.mockRejectedValue(new Error('fail'));
      const res = await GET();
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json).toEqual({ error: 'Failed to fetch notes' });
    });
  });

  describe('POST', () => {
    it('returns 401 if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const res = await POST(createMockRequest({ title: 't', content: 'c' }));
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 if title or content missing', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      const res = await POST(createMockRequest({ title: '', content: '' }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Title and content are required' });
    });

    it('creates note for authenticated user', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      const note = { id: 'n1', title: 't', content: 'c' };
      mockCreate.mockResolvedValue(note);
      const res = await POST(createMockRequest({ title: 't', content: 'c' }));
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json).toEqual(note);
    });

    it('returns 500 on error', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } });
      mockCreate.mockRejectedValue(new Error('fail'));
      const res = await POST(createMockRequest({ title: 't', content: 'c' }));
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json).toEqual({ error: 'Failed to create note' });
    });
  });
});
