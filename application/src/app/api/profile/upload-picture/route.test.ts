// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

// Mock storage service
const mockUploadFile = jest.fn();
const mockGetFileUrl = jest.fn();
jest.mock('../../../../services/storage/storage', () => ({
  createStorageService: () => ({
    uploadFile: mockUploadFile,
    getFileUrl: mockGetFileUrl,
  }),
}));

// Mock auth
const mockAuth = jest.fn();
jest.mock('../../../../lib/auth', () => ({
  auth: async () => mockAuth(),
}));

// Mock database client
const mockFindById = jest.fn();
const mockUpdate = jest.fn();
jest.mock('../../../../services/database/database', () => ({
  createDatabaseClient: () => ({
    user: {
      findById: mockFindById,
      update: mockUpdate,
    },
  }),
}));

import { NextRequest } from 'next/server';
// Import the handler after mocks
import { POST } from './route';

describe('upload picture should', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: authenticated user with id 'user-123'
  });
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } });
    mockFindById.mockResolvedValue({ id: 'user-id', image: 'image-url' });
  });

  function createFile(name: string, type: string, size: number) {
    const file = new File(['a'.repeat(size)], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }

  function createFormDataWithFile(file: File) {
    return {
      get: (key: string) => (key === 'file' ? file : null),
    };
  }

  function createRequestWithFile(file: File) {
    return {
      formData: async () => createFormDataWithFile(file),
    } as NextRequest;
  }

  it('return error if file type is not jpg or png', async () => {
    // auth is mocked as authenticated
    const file = createFile('test.txt', 'text/plain', 100);
    const req = createRequestWithFile(file);
    const res = await POST(req);
    const json = await res.json();
    expect(json).toEqual({ error: 'Only JPG or PNG files are allowed' });
    expect(res.status).toBe(400);
  });

  it('return error if file size is greater than 5MB', async () => {
    // auth is mocked as authenticated
    const file = createFile('test.jpg', 'image/jpeg', 6 * 1024 * 1024);
    const req = createRequestWithFile(file);
    const res = await POST(req);
    const json = await res.json();
    expect(json).toEqual({ error: 'File size must be 5MB or less' });
    expect(res.status).toBe(400);
  });

  it('return error if upload fails', async () => {
    // auth is mocked as authenticated
    mockUploadFile.mockRejectedValueOnce(new Error('Upload failed'));
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFile(file);
    const res = await POST(req);
    const json = await res.json();
    expect(json).toEqual({ error: 'File upload failed' });
    expect(res.status).toBe(500);
  });

  it('return success response on successful upload', async () => {
    // auth is mocked as authenticated
    mockUploadFile.mockResolvedValueOnce('mock-uuid.jpg');
    mockGetFileUrl.mockResolvedValueOnce('https://example.com/file-url');
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFile(file);
    const res = await POST(req);
    const json = await res.json();
    expect(json).toEqual({ name: 'mock-uuid.jpg', url: 'https://example.com/file-url' });
    expect(res.status).toBe(200);
  });

  it('return error if user is not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFile(file);
    const res = await POST(req);
    const json = await res.json();
    expect(json).toEqual({ error: 'Unauthorized' });
    expect(res.status).toBe(401);
  });

  it('return error if user not found in db', async () => {
    // auth is mocked as authenticated
    mockFindById.mockResolvedValueOnce(null);
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFile(file);
    mockUploadFile.mockResolvedValueOnce('mock-uuid.jpg');
    mockGetFileUrl.mockResolvedValueOnce('https://example.com/file-url');
    const res = await POST(req);
    const json = await res.json();
    expect(json).toEqual({ error: 'User not found' });
    expect(res.status).toBe(404);
  });

  it('return error if db update fails', async () => {
    // auth is mocked as authenticated
    mockUploadFile.mockResolvedValueOnce('mock-uuid.jpg');
    mockGetFileUrl.mockResolvedValueOnce('https://example.com/file-url');
    mockUpdate.mockRejectedValueOnce(new Error('DB update failed'));
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFile(file);
    const res = await POST(req);
    const json = await res.json();
    expect(json).toEqual({ error: 'File upload failed' });
    expect(res.status).toBe(500);
  });
});
