import { USER_ROLES } from 'lib/auth/roles';
import { getAllNotes } from './getAllNotes';
import { NextRequest } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';

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

  const user = { id: 'user-1', role: USER_ROLES.USER };

  it('returns notes for user and status 200', async () => {
    const notes = [
      { id: 'n1', userId: 'user-1', title: 't1', content: 'c1', createdAt: 'now' },
      { id: 'n2', userId: 'user-1', title: 't2', content: 'c2', createdAt: 'now' },
    ];
    mockFindByUserId.mockResolvedValue(notes);
    const req = makeRequest();
    const res = await getAllNotes(req, user);
    expect(mockFindByUserId).toHaveBeenCalledWith('user-1');
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual(notes);
  });

  it('returns 500 on db error', async () => {
    mockFindByUserId.mockRejectedValue(new Error('fail'));
    const req = makeRequest();
    const res = await getAllNotes(req, user);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Failed to fetch notes' });
  });
});
