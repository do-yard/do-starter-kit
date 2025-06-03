import { StatusService } from './statusService';
import { serverConfig } from '../../../settings';
import * as storageModule from '../storage/storage';

// Mock the storage module
jest.mock('../storage/storage', () => {
  const mockStorageService = {
    checkConnection: jest.fn(),
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  };
  
  return {
    createStorageService: jest.fn(() => mockStorageService),
    __mockStorageService: mockStorageService
  };
});

describe('StatusService', () => {
  const originalConfig = {
    storageProvider: serverConfig.storageProvider,
    accessKey: serverConfig.Spaces.accessKey,
    secretKey: serverConfig.Spaces.secretKey,
    bucketName: serverConfig.Spaces.bucketName,
    endpoint: serverConfig.Spaces.endpoint,
    region: serverConfig.Spaces.region
  };
  
  const mockStorageService = (storageModule as any).__mockStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set default mock values for testing
    serverConfig.storageProvider = 'Spaces';
    serverConfig.Spaces.accessKey = 'test-access-key';
    serverConfig.Spaces.secretKey = 'test-secret-key';
    serverConfig.Spaces.bucketName = 'test-bucket';
    serverConfig.Spaces.endpoint = 'https://test.endpoint.com';
    serverConfig.Spaces.region = 'test-region';
  });
  
  afterAll(() => {
    // Restore original config
    serverConfig.storageProvider = originalConfig.storageProvider;
    serverConfig.Spaces.accessKey = originalConfig.accessKey;
    serverConfig.Spaces.secretKey = originalConfig.secretKey;
    serverConfig.Spaces.bucketName = originalConfig.bucketName;
    serverConfig.Spaces.endpoint = originalConfig.endpoint;
    serverConfig.Spaces.region = originalConfig.region;
  });

  describe('checkStorageStatus', () => {
    it('should report configured=true and connected=true when all is well', async () => {
      // Arrange
      mockStorageService.checkConnection.mockResolvedValue(true);

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(true);
      expect(result.connected).toBe(true);
      expect(result.error).toBeUndefined();
      expect(storageModule.createStorageService).toHaveBeenCalled();
    });

    it('should report configured=false when configuration is missing', async () => {
      // Arrange
      serverConfig.Spaces.accessKey = '';

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.error).toContain('Missing required');
      expect(storageModule.createStorageService).not.toHaveBeenCalled();
    });

    it('should report connected=false when connection fails', async () => {
      // Arrange
      mockStorageService.checkConnection.mockResolvedValue(false);

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.error).toContain('Failed to connect to');
    });

    it('should handle exceptions during storage service creation', async () => {
      // Arrange
      (storageModule.createStorageService as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to initialize');
      });

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.error).toContain('Failed to initialize storage service');
    });

    it('should handle exceptions during connection check', async () => {
      // Arrange
      mockStorageService.checkConnection.mockImplementationOnce(() => {
        throw new Error('Connection error');
      });

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.error).toContain('Failed to connect to storage service');
    });
  });

  describe('checkAllServices', () => {
    it('should return an array with the storage service status', async () => {
      // Arrange
      mockStorageService.checkConnection.mockResolvedValue(true);

      // Act
      const results = await StatusService.checkAllServices();

      // Assert
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('Storage');
    });
  });
});
