import { deleteNote } from './deleteNote';
import { NextRequest } from 'next/server';

const mockFindById = jest.fn();
const mockDelete = jest.fn();
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    note: {
      findById: mockFindById,
      delete: mockDelete,
    },
  }),
}));

describe('deleteNote', () => {
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
  const note = { id: 'n1', userId: 'user-1', title: 't', content: 'c', createdAt: 'now' };

  it('deletes note and returns 200', async () => {
    mockFindById.mockResolvedValue(note);
    mockDelete.mockResolvedValue(undefined);
    const req = makeRequest();
    const res = await deleteNote(req, user, makeParams('n1'));
    expect(mockFindById).toHaveBeenCalledWith('n1');
    expect(mockDelete).toHaveBeenCalledWith('n1');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('returns 404 if note not found', async () => {
    mockFindById.mockResolvedValue(null);
    const req = makeRequest();
    const res = await deleteNote(req, user, makeParams('n1'));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Note not found' });
  });

  it('returns 403 if user does not own note', async () => {
    mockFindById.mockResolvedValue({ ...note, userId: 'other' });
    const req = makeRequest();
    const res = await deleteNote(req, user, makeParams('n1'));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 500 on db error', async () => {
    mockFindById.mockResolvedValue(note);
    mockDelete.mockRejectedValue(new Error('fail'));
    const req = makeRequest();
    const res = await deleteNote(req, user, makeParams('n1'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to delete note' });
  });
});
