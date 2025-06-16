import { POST } from './route';
import { NextRequest } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createEmailService } from 'services/email/emailFactory';

jest.mock('services/database/databaseFactory');
jest.mock('services/email/emailFactory');
jest.mock('services/email/emailTemplate', () => ({ emailTemplate: jest.fn(() => 'html') }));

const mockDb = {
  user: {
    findByEmail: jest.fn(),
  },
  verificationToken: {
    create: jest.fn(),
  },
};
const mockEmailClient = { sendReactEmail: jest.fn() };

(createDatabaseService as jest.Mock).mockReturnValue(mockDb);
(createEmailService as jest.Mock).mockReturnValue(mockEmailClient);

describe('POST /api/auth/magic-link', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(email?: string) {
    return {
      json: async () => (email ? { email } : {}),
    } as unknown as NextRequest;
  }

  it('returns 400 if email is missing', async () => {
    const req = makeRequest();
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/email is required/i);
  });

  it('returns 404 if user is not found', async () => {
    mockDb.user.findByEmail.mockResolvedValue(null);
    const req = makeRequest('notfound@example.com');
    const res = await POST(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toMatch(/user not found/i);
  });

  it('returns 200 and sends email if user exists', async () => {
    mockDb.user.findByEmail.mockResolvedValue({ email: 'test@example.com' });
    mockDb.verificationToken.create.mockResolvedValue(undefined);
    mockEmailClient.sendReactEmail = jest.fn().mockResolvedValue(undefined);
    const req = makeRequest('test@example.com');
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockDb.user.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockDb.verificationToken.create).toHaveBeenCalled();
    expect(mockEmailClient.sendReactEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Login to your account',
      expect.any(Object)
    );
  });

  it('returns 500 if an error is thrown', async () => {
    mockDb.user.findByEmail.mockRejectedValue(new Error('db error'));
    const req = makeRequest('fail@example.com');
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/db error/i);
  });
});
