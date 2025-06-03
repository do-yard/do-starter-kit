import { getAllNotes } from './getAllNotes';
import { NextRequest } from 'next/server';

const mockFindByUserId = jest.fn();
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    note: {
      findByUserId: mockFindByUserId,
    },
  }),
}));

describe('getAllNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest() {
    return {} as unknown as NextRequest;
  }

  const user = { id: 'user-1', role: 'USER' };

  it('returns notes for user and status 200', async () => {
    const notes = [
      { id: 'n1', userId: 'user-1', title: 't1', content: 'c1', createdAt: 'now' },
      { id: 'n2', userId: 'user-1', title: 't2', content: 'c2', createdAt: 'now' },
    ];
    mockFindByUserId.mockResolvedValue(notes);
    const req = makeRequest();
    const res = await getAllNotes(req, user);
    expect(mockFindByUserId).toHaveBeenCalledWith('user-1');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(notes);
  });

  it('returns 500 on db error', async () => {
    mockFindByUserId.mockRejectedValue(new Error('fail'));
    const req = makeRequest();
    const res = await getAllNotes(req, user);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch notes' });
  });
});
