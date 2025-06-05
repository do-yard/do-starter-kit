jest.mock('services/database/database');
//jest.mock('helpers/hash');

import { updatePassword } from './updatePassword';
import { NextRequest } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { hashPassword, verifyPassword } from 'helpers/hash';

const mockDb = {
  user: {
    findById: jest.fn(),
    update: jest.fn(),
  },
};

const mockHash = {
    verifyPassword: jest.fn(),
    hashPassword: jest.fn(),
};

const mockUser = { id: 'user1', role: 'user' };

function createRequestWithFormData(fields: Record<string, string>) {
  return {
    formData: async () => new Map(Object.entries(fields)),
  } as unknown as NextRequest;
}

describe('updatePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('services/database/database').createDatabaseClient as jest.Mock).mockReturnValue(mockDb);
    //(require('helpers/hash') as jest.Mock).mockReturnValue(mockHash);
  });

  it('returns error if current password is empty', async () => {
    const req = createRequestWithFormData({ currentPassword: '', newPassword: 'a', confirmNewPassword: 'a' });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.error).toMatch(/current password cannot be empty/i);
  });

  it('returns error if new password is empty', async () => {
    const req = createRequestWithFormData({ currentPassword: 'a', newPassword: '', confirmNewPassword: 'a' });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.error).toMatch(/new password cannot be empty/i);
  });

  it('returns error if confirm new password is empty', async () => {
    const req = createRequestWithFormData({ currentPassword: 'a', newPassword: 'a', confirmNewPassword: '' });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.error).toMatch(/confirm new password cannot be empty/i);
  });

  it('returns error if new passwords do not match', async () => {
    const req = createRequestWithFormData({ currentPassword: 'a', newPassword: 'b', confirmNewPassword: 'c' });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.error).toMatch(/new passwords do not match/i);
  });

  it('returns error if user does not exist', async () => {
    mockDb.user.findById.mockResolvedValue(null);
    const req = createRequestWithFormData({ currentPassword: 'a', newPassword: 'b', confirmNewPassword: 'b' });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(json.error).toMatch(/doesn't exist/i);
  });

  it('returns error if current password is incorrect', async () => {
    mockDb.user.findById.mockResolvedValue({ passwordHash: 'hash' });
    //(require('helpers/hash').verifyPassword as jest.Mock).mockResolvedValue(false);
    const req = createRequestWithFormData({ currentPassword: 'wrong', newPassword: 'b', confirmNewPassword: 'b' });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(json.error).toMatch(/current password is incorrect/i);
  });

  it('updates password and returns success', async () => {
    mockDb.user.findById.mockResolvedValue({ id: 'user1', name: 'Test', image: 'img', passwordHash: 'old' });

    // Only mock for this test
    const verifyPasswordSpy = jest.spyOn(require('helpers/hash'), 'verifyPassword').mockResolvedValue(true);
    const hashPasswordSpy = jest.spyOn(require('helpers/hash'), 'hashPassword').mockResolvedValue('newhash');

    mockDb.user.update.mockResolvedValue(undefined);
    const req = createRequestWithFormData({ currentPassword: 'old', newPassword: 'new', confirmNewPassword: 'new' });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(json.name).toBe('Test');
    expect(json.image).toBe('img');

    // Restore the original implementation after the test
    verifyPasswordSpy.mockRestore();
    hashPasswordSpy.mockRestore();
  });

  it('returns 500 on unexpected error', async () => {
    mockDb.user.findById.mockRejectedValue(new Error('db error'));
    const req = createRequestWithFormData({ currentPassword: 'a', newPassword: 'b', confirmNewPassword: 'b' });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.error).toMatch(/internal server error/i);
  });
});
