import { StatusService } from './statusService';
import { serverConfig } from '../../../settings';
import * as storageModule from '../storage/storageFactory';
import * as emailModule from '../email/emailFactory';
import * as databaseModule from '../database/databaseFactory';

// Mock the storage module
jest.mock('../storage/storageFactory', () => {
  const mockStorageService = {
    checkConnection: jest.fn(),
    checkConfiguration: jest.fn(),
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
    isRequired: jest.fn().mockReturnValue(true),
  };
  
  return {
    createStorageService: jest.fn(() => Promise.resolve(mockStorageService)),
    __mockStorageService: mockStorageService
  };
});

// Mock the email service
jest.mock('../email/emailFactory', () => {
  const mockEmailService = {
    checkConfiguration: jest.fn(),
    sendEmail: jest.fn(),
    isRequired: jest.fn().mockReturnValue(true),
  };
  
  return {
    createEmailService: jest.fn(() => Promise.resolve(mockEmailService)),
    __mockEmailService: mockEmailService
  };
});

// Mock the database service
jest.mock('../database/databaseFactory', () => {
  const mockDatabaseService = {
    checkConnection: jest.fn().mockResolvedValue(true),
    checkConfiguration: jest.fn().mockResolvedValue({
      name: 'Database Service',
      configured: true,
      connected: true,
      error: null,
      configToReview: undefined
    }),
    isRequired: jest.fn().mockReturnValue(true),
  };
  
  return {
    createDatabaseService: jest.fn(() => Promise.resolve(mockDatabaseService)),
    __mockDatabaseService: mockDatabaseService
  };
});

describe('StatusService', () => {  const originalConfig = {
    storageProvider: serverConfig.storageProvider,
    accessKey: serverConfig.Spaces.SPACES_KEY_ID,
    secretKey: serverConfig.Spaces.SPACES_KEY_SECRET,
    bucketName: serverConfig.Spaces.SPACES_BUCKET_NAME,
    endpoint: undefined, // This may not exist in the new structure
    region: serverConfig.Spaces.SPACES_REGION
  };
    const mockStorageService = (storageModule as { __mockStorageService: unknown }).__mockStorageService;
  const mockEmailService = (emailModule as { __mockEmailService: unknown }).__mockEmailService;
  const mockDatabaseService = (databaseModule as { __mockDatabaseService: unknown }).__mockDatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset static state
    (StatusService as { cachedHealthState: unknown; isInitialized: boolean }).cachedHealthState = null;
    (StatusService as { isInitialized: boolean }).isInitialized = false;
      // Set default mock values for testing
    serverConfig.storageProvider = 'Spaces';
    serverConfig.Spaces.SPACES_KEY_ID = 'test-access-key';
    serverConfig.Spaces.SPACES_KEY_SECRET = 'test-secret-key';
    serverConfig.Spaces.SPACES_BUCKET_NAME = 'test-bucket';
    serverConfig.Spaces.SPACES_REGION = 'test-region';
    
    // Setup default mock responses
    mockStorageService.checkConfiguration.mockResolvedValue({
      name: 'Storage Service',
      configured: true,
      connected: true,
      error: null,
      configToReview: undefined
    });
    
    mockEmailService.checkConfiguration.mockReturnValue({
      name: 'Email Service', 
      configured: true,
      connected: true,
      error: null,
      configToReview: undefined
    });
  });
  
  afterAll(() => {
    // Restore original config
    serverConfig.storageProvider = originalConfig.storageProvider;
    serverConfig.Spaces.SPACES_KEY_ID = originalConfig.accessKey;
    serverConfig.Spaces.SPACES_KEY_SECRET = originalConfig.secretKey;
    serverConfig.Spaces.SPACES_BUCKET_NAME = originalConfig.bucketName;
    serverConfig.Spaces.SPACES_REGION = originalConfig.region;
  });

  describe('checkStorageStatus', () => {
    it('should report configured=true and connected=true when all is well', async () => {
      // Arrange
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Storage Service',
        configured: true,
        connected: true,
        error: null,
        configToReview: undefined
      });

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(true);
      expect(result.connected).toBe(true);
      expect(result.error).toBeNull();
      expect(storageModule.createStorageService).toHaveBeenCalled();
    });

    it('should report configured=false when configuration is missing', async () => {
      // Arrange
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Storage Service',
        configured: false,
        connected: false,
        error: 'Missing configuration',
        configToReview: ['SPACES_KEY']
      });

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Missing configuration');
      expect(result.configToReview).toEqual(['SPACES_KEY']);
    });

    it('should report connected=false when connection fails', async () => {
      // Arrange
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Storage Service',
        configured: true,
        connected: false,
        error: 'Connection failed',
        configToReview: ['SPACES_KEY']
      });

      // Act  
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(true);
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Connection failed');
    });

    it('should handle exceptions during storage service creation', async () => {
      // Arrange
      (storageModule.createStorageService as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to initialize');
      });

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.error).toContain('Failed to initialize storage service');
    });

    it('should handle exceptions during connection check', async () => {
      // Arrange
      mockStorageService.checkConfiguration.mockRejectedValue(new Error('Connection error'));

      // Act
      const result = await StatusService.checkStorageStatus();

      // Assert
      expect(result.configured).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.error).toContain('Failed to initialize storage service');
    });
  });
  describe('checkAllServices', () => {
    it('should return an array with storage, email, and database service status', async () => {
      // Arrange
      mockStorageService.checkConnection.mockResolvedValue(true);

      // Act
      const results = await StatusService.checkAllServices();

      // Assert
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3); // Storage + Email + Database
      expect(results.some(r => r.name.includes('Storage'))).toBe(true);
      expect(results.some(r => r.name.includes('Email'))).toBe(true);
      expect(results.some(r => r.name.includes('Database'))).toBe(true);
    });
  });

  describe('Health State Management', () => {
    beforeEach(() => {
      // Reset static state
      (StatusService as { cachedHealthState: unknown; isInitialized: boolean }).cachedHealthState = null;
      (StatusService as { isInitialized: boolean }).isInitialized = false;
    });

    it('should initialize and cache health state', async () => {
      // Arrange - Mock services as healthy
      const originalResendApiKey = process.env.RESEND_API_KEY;
      const originalSmtpHost = process.env.SMTP_HOST;
      
      // Set environment variables for email service
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.SMTP_HOST = 'test-smtp-host';
      
      mockStorageService.checkConnection.mockResolvedValue(true);
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Spaces Storage',
        configured: true,
        connected: true,
        configToReview: undefined,
        error: undefined
      });

      try {
        // Act
        await StatusService.initialize();
        const healthState = StatusService.getHealthState();        // Assert
        expect(healthState).toBeDefined();
        expect(healthState?.services).toHaveLength(3); // Storage + Email + Database
        expect(healthState?.isHealthy).toBe(true);
        expect(StatusService.isApplicationHealthy()).toBe(true);
      } finally {
        // Cleanup environment variables
        if (originalResendApiKey !== undefined) {
          process.env.RESEND_API_KEY = originalResendApiKey;
        } else {
          delete process.env.RESEND_API_KEY;
        }
        if (originalSmtpHost !== undefined) {
          process.env.SMTP_HOST = originalSmtpHost;
        } else {
          delete process.env.SMTP_HOST;
        }
      }
    });

    it('should return cached state without re-checking', async () => {
      // Arrange - Mock services as healthy
      const originalResendApiKey = process.env.RESEND_API_KEY;
      const originalSmtpHost = process.env.SMTP_HOST;
      
      // Set environment variables for email service
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.SMTP_HOST = 'test-smtp-host';
      
      mockStorageService.checkConnection.mockResolvedValue(true);
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Spaces Storage',
        configured: true,
        connected: true,
        configToReview: undefined,
        error: undefined
      });

      try {
        await StatusService.initialize();

      // Act
      const firstCall = StatusService.getHealthState();
      const secondCall = StatusService.getHealthState();

      // Assert
      expect(firstCall).toBe(secondCall); // Same object reference
      expect(storageModule.createStorageService).toHaveBeenCalledTimes(1);
      } finally {
        // Cleanup environment variables
        if (originalResendApiKey !== undefined) {
          process.env.RESEND_API_KEY = originalResendApiKey;
        } else {
          delete process.env.RESEND_API_KEY;
        }
        if (originalSmtpHost !== undefined) {
          process.env.SMTP_HOST = originalSmtpHost;
        } else {
          delete process.env.SMTP_HOST;
        }
      }
    });

    it('should force fresh check when requested', async () => {
      // Arrange - Mock services as healthy
      const originalResendApiKey = process.env.RESEND_API_KEY;
      const originalSmtpHost = process.env.SMTP_HOST;
      
      // Set environment variables for email service
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.SMTP_HOST = 'test-smtp-host';
      
      mockStorageService.checkConnection.mockResolvedValue(true);
      mockStorageService.checkConfiguration.mockResolvedValue({
        name: 'Spaces Storage',
        configured: true,
        connected: true,
        configToReview: undefined,
        error: undefined
      });

      try {
        await StatusService.initialize();

      // Act
      const cachedState = StatusService.getHealthState();
      const freshState = await StatusService.forceHealthCheck();

      // Assert
      expect(freshState).not.toBe(cachedState); // Different object reference
      expect(storageModule.createStorageService).toHaveBeenCalledTimes(2);
      } finally {
        // Cleanup environment variables
        if (originalResendApiKey !== undefined) {
          process.env.RESEND_API_KEY = originalResendApiKey;
        } else {
          delete process.env.RESEND_API_KEY;
        }
        if (originalSmtpHost !== undefined) {
          process.env.SMTP_HOST = originalSmtpHost;
        } else {
          delete process.env.SMTP_HOST;
        }
      }
    });

    it('should report unhealthy when services have issues', async () => {
      // Arrange
      mockStorageService.checkConfiguration.mockReturnValue({
        name: 'Storage Service',
        configured: false,
        connected: false,
        error: 'Configuration missing',
        configToReview: ['SPACES_KEY']
      });

      // Act
      await StatusService.initialize();

      // Assert
      expect(StatusService.isApplicationHealthy()).toBe(false);
      const healthState = StatusService.getHealthState();
      expect(healthState?.isHealthy).toBe(false);
    });
  });
});
