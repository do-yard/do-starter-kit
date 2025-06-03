import { serverConfig } from '../../../settings';
import { createStorageService, StorageService } from '../storage/storage';

/**
 * Interface for service status information.
 */
export interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  error?: string;
  warning?: string;
}

/**
 * Service for checking configuration and connectivity status of various services.
 */
export class StatusService {  /**
   * Checks the status of storage service configuration and connectivity.
   * Uses the StorageService interface to check the current storage provider.
   * 
   * @returns {Promise<ServiceStatus>} The status of the storage service.
   */
  static async checkStorageStatus(): Promise<ServiceStatus> {
    const storageType = serverConfig.storageProvider;
    const status: ServiceStatus = {
      name: `Storage (${storageType})`,
      configured: false,
      connected: false,
    };    // Check if storage configuration is available
    if (serverConfig.storageProvider === 'Spaces') {
      // Map configuration values to environment variable names for clearer error messages
      const configItems = {
        'SPACES_KEY': serverConfig.Spaces.accessKey,
        'SPACES_SECRET': serverConfig.Spaces.secretKey,
        'SPACES_BUCKETNAME': serverConfig.Spaces.bucketName, // Note: This is SPACES_BUCKETNAME, not SPACES_BUCKET
        'SPACES_ENDPOINT': serverConfig.Spaces.endpoint,
        'SPACES_REGION': serverConfig.Spaces.region
      };
      
      // Find missing configuration items
      const missingItems = Object.entries(configItems)
        .filter(([_, value]) => !value || value.trim() === '')
        .map(([key, _]) => key);
      
      if (missingItems.length > 0) {
        status.error = `Missing required Spaces configuration: ${missingItems.join(', ')}. Please check your .env file.`;
        return status;
      }
      
      // Check for potentially incorrect values (values that look like placeholders from env-example)
      const suspiciousValues = Object.entries(configItems)
        .filter(([key, value]) => {
          if (!value) return false;
          const strValue = String(value).trim();
          
          // Check if the value looks like a placeholder from env-example
          return strValue.includes('your-') || 
                 strValue === 'my-app-bucket' || 
                 (key === 'SPACES_ENDPOINT' && !strValue.includes('digitaloceanspaces.com')) ||
                 (key === 'SPACES_SECRET' && strValue.length < 20);
        })
        .map(([key, value]) => `${key} (value: "${typeof value === 'string' ? value.substring(0, 5) + '...' : value}")`);
      
      if (suspiciousValues.length > 0) {
        status.warning = `Some values appear to be default placeholders or invalid: ${suspiciousValues.join(', ')}. Make sure these are set correctly.`;
      }
    }
    // If a different storage provider is added in the future, add its config check here
    
    // All required configurations are present
    status.configured = true;

    status.configured = true;

    // Try to connect to storage service through the interface
    try {
      let storageService: StorageService;
      
      try {
        // Attempt to create storage service - this may fail if config is invalid
        storageService = createStorageService();
      } catch (error) {
        status.error = error instanceof Error
          ? `Failed to initialize storage service: ${error.message}`
          : 'Failed to initialize storage service: Unknown error';
        return status;
      }
      
      // Check connection to storage service
      const connected = await storageService.checkConnection();
      status.connected = connected;
      
      if (!connected) {
        status.error = `Failed to connect to ${storageType} storage service.`;
      }
    } catch (error) {
      status.error = error instanceof Error 
        ? `Failed to connect to storage service: ${error.message}` 
        : 'Failed to connect to storage service: Unknown error';
    }

    return status;
  }
  /**
   * Checks the status of all configured services.
   * 
   * @returns {Promise<ServiceStatus[]>} The status of all services.
   */
  static async checkAllServices(): Promise<ServiceStatus[]> {
    // Currently only checking Storage, but we can add more services later
    const storage = await this.checkStorageStatus();
    return [storage];
  }
}
