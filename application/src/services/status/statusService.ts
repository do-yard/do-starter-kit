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
    };

    // Create storage service and check configuration status
    try {
      const storageService = createStorageService();
      const providerName = storageService.getProviderName();
      status.name = `Storage (${providerName})`;
      
      // Get configuration status from the service
      const configStatus = storageService.checkConfiguration();
      status.configured = configStatus.configured;
        // Set any error messages
      if (configStatus.error) {
        status.error = configStatus.error;
      }
      
      if (configStatus.missingConfig && configStatus.missingConfig.length > 0) {
        status.error = `Missing required configuration: ${configStatus.missingConfig.join(', ')}. Please check your .env file.`;
      }
      
      // Only check connection if the service is properly configured
      if (status.configured) {
        const connected = await storageService.checkConnection();
        status.connected = connected;
        
        if (!connected) {
          status.error = `Failed to connect to ${providerName}. Service may be unavailable or credentials may be incorrect.`;
        }
      }
    } catch (error) {
      status.error = error instanceof Error 
        ? `Failed to initialize storage service: ${error.message}` 
        : 'Failed to initialize storage service: Unknown error';
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
