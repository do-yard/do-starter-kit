import { getNote } from './getNote';
import { NextRequest } from 'next/server';

const mockFindById = jest.fn();
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    note: {
      findById: mockFindById,
    },
  }),
}));

describe('getNote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeParams(id: string) {
    return Promise.resolve({ id });
  }
  function makeRequest() {
    return {} as unknown as NextRequest;
  }

  const user = { id: 'user-1', role: 'USER' };

  it('returns note for user and status 200', async () => {
    const note = { id: 'n1', userId: 'user-1', title: 't', content: 'c', createdAt: 'now' };
    mockFindById.mockResolvedValue(note);
    const req = makeRequest();
    const res = await getNote(req, user, makeParams('n1'));
    expect(mockFindById).toHaveBeenCalledWith('n1');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(note);
  });

  it('returns 404 if note not found', async () => {
    mockFindById.mockResolvedValue(null);
    const req = makeRequest();
    const res = await getNote(req, user, makeParams('n1'));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Note not found' });
  });

  it('returns 403 if user does not own note', async () => {
    const note = { id: 'n1', userId: 'other', title: 't', content: 'c', createdAt: 'now' };
    mockFindById.mockResolvedValue(note);
    const req = makeRequest();
    const res = await getNote(req, user, makeParams('n1'));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 500 on db error', async () => {
    mockFindById.mockRejectedValue(new Error('fail'));
    const req = makeRequest();
    const res = await getNote(req, user, makeParams('n1'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch note' });
  });
});
