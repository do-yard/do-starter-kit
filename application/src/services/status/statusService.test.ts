import { StatusService } from './statusService';
import { serverConfig } from '../../../settings';
import * as storageModule from '../storage/storage';
import * as emailModule from '../email/email';

// Mock the storage module
jest.mock('../storage/storage', () => {
  const mockStorageService = {
    checkConnection: jest.fn(),
    checkConfiguration: jest.fn(),
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  };
  
  return {
    createStorageService: jest.fn(() => mockStorageService),
    __mockStorageService: mockStorageService
  };
});

// Mock the email service
jest.mock('../email/email', () => {
  const mockEmailService = {
    checkConfiguration: jest.fn(),
    sendEmail: jest.fn(),
  };
  
  return {
    createEmailService: jest.fn(() => mockEmailService),
    __mockEmailService: mockEmailService
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
  const mockEmailService = (emailModule as any).__mockEmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset static state
    (StatusService as any).cachedHealthState = null;
    (StatusService as any).isInitialized = false;
    
    // Set default mock values for testing
    serverConfig.storageProvider = 'Spaces';
    serverConfig.Spaces.accessKey = 'test-access-key';
    serverConfig.Spaces.secretKey = 'test-secret-key';
    serverConfig.Spaces.bucketName = 'test-bucket';
    serverConfig.Spaces.endpoint = 'https://test.endpoint.com';
    serverConfig.Spaces.region = 'test-region';
    
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
    serverConfig.Spaces.accessKey = originalConfig.accessKey;
    serverConfig.Spaces.secretKey = originalConfig.secretKey;
    serverConfig.Spaces.bucketName = originalConfig.bucketName;
    serverConfig.Spaces.endpoint = originalConfig.endpoint;
    serverConfig.Spaces.region = originalConfig.region;
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
    it('should return an array with storage and email service status', async () => {
      // Arrange
      mockStorageService.checkConnection.mockResolvedValue(true);

      // Act
      const results = await StatusService.checkAllServices();

      // Assert
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2); // Storage + Email
      expect(results.some(r => r.name.includes('Storage'))).toBe(true);
      expect(results.some(r => r.name.includes('Email'))).toBe(true);
    });
  });

  describe('Health State Management', () => {
    beforeEach(() => {
      // Reset static state
      (StatusService as any).cachedHealthState = null;
      (StatusService as any).isInitialized = false;
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
        const healthState = StatusService.getHealthState();

        // Assert
        expect(healthState).toBeDefined();
        expect(healthState?.services).toHaveLength(2); // Storage + Email
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
