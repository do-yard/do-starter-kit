import { USER_ROLES } from 'lib/auth/roles';
import { getAllNotes } from './getAllNotes';
import { NextRequest } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';

const mockFindMany = jest.fn();
const mockCount = jest.fn();
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    note: {
      findMany: mockFindMany,
      count: mockCount,
    },
  }),
}));

describe('getAllNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(url = 'http://localhost/api/notes?page=1&pageSize=10') {
    return { url } as unknown as NextRequest;
  }

  const user = { id: 'user-1', role: USER_ROLES.USER };

  it('returns paginated notes and total for user and status 200', async () => {
    const notes = [
      { id: 'n1', userId: 'user-1', title: 't1', content: 'c1', createdAt: 'now' },
      { id: 'n2', userId: 'user-1', title: 't2', content: 'c2', createdAt: 'now' },
    ];
    mockFindMany.mockResolvedValue(notes);
    mockCount.mockResolvedValue(5);
    const req = makeRequest();
    const res = await getAllNotes(req, user);
    expect(mockFindMany).toHaveBeenCalledWith({
      userId: 'user-1',
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(mockCount).toHaveBeenCalledWith('user-1', undefined);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ notes, total: 5 });
  });

  it('calls findMany and count with search param if provided', async () => {
    const notes = [
      { id: 'n1', userId: 'user-1', title: 'meeting', content: 'notes', createdAt: 'now' },
    ];
    mockFindMany.mockResolvedValue(notes);
    mockCount.mockResolvedValue(1);
    const req = makeRequest('http://localhost/api/notes?page=1&pageSize=10&search=meet');
    const res = await getAllNotes(req, user);
    expect(mockFindMany).toHaveBeenCalledWith({
      userId: 'user-1',
      search: 'meet',
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(mockCount).toHaveBeenCalledWith('user-1', 'meet');
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ notes, total: 1 });
  });

  it('returns 500 on db error', async () => {
    mockFindMany.mockRejectedValue(new Error('fail'));
    mockCount.mockResolvedValue(0);
    const req = makeRequest();
    const res = await getAllNotes(req, user);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Failed to fetch notes' });
  });
});
