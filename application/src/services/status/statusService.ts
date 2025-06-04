import { createStorageService, StorageService } from '../storage/storage';
import { ServiceConfigStatus } from './serviceConfigStatus';

/**
 * Interface for service status information.
 */
export interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  error?: string;
  configToReview?: string[];
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
    const status: ServiceStatus = {
      name: 'Storage Service',
      configured: false,
      connected: false,
    };

    // Create storage service and check configuration status
    try {
      const storageService = createStorageService();
      const providerName = storageService.getProviderName();
      status.name = `Storage (${providerName})`;

      // Get configuration status from the service including connection check
      const configStatus = await storageService.checkConfiguration();
      status.configured = configStatus.configured;
      status.connected = configStatus.connected || false;
      
      // Set any error messages and config to review
      if (configStatus.error) {
        status.error = configStatus.error;
      }
      if (configStatus.configToReview) {
        status.configToReview = configStatus.configToReview;
      }
    } catch (error) {
      status.error = error instanceof Error
        ? `Failed to initialize storage service: ${error.message}` 
        : 'Failed to initialize storage service: Unknown error';
    }    return status;
  }

  /**
   * Example: Checks the status of email service configuration and connectivity.
   * This is a mock implementation to demonstrate how easily new services can be added.
   * 
   * @returns {Promise<ServiceStatus>} The status of the email service.
   */
  static async checkEmailStatus(): Promise<ServiceStatus> {
    const status: ServiceStatus = {
      name: 'Email Service',
      configured: false,
      connected: false,
    };

    try {
      // Mock check - in a real implementation, this would check actual email service configuration
      const hasEmailConfig = process.env.RESEND_API_KEY || process.env.SMTP_HOST;
      
      if (hasEmailConfig) {
        status.configured = true;
        status.connected = true; // In real implementation, would test connection
      } else {
        status.error = 'Email service not configured';
        status.configToReview = ['RESEND_API_KEY', 'SMTP_HOST'];
      }
    } catch (error) {
      status.error = error instanceof Error 
        ? `Failed to check email service: ${error.message}` 
        : 'Failed to check email service: Unknown error';
    }

    return status;
  }

  /**
   * Checks the status of all configured services.
   * This method will automatically check all available services.
   * 
   * @returns {Promise<ServiceStatus[]>} The status of all services.
   */
  static async checkAllServices(): Promise<ServiceStatus[]> {
    const services: ServiceStatus[] = [];
    
    // Check storage service
    try {
      const storageStatus = await this.checkStorageStatus();
      services.push(storageStatus);
    } catch (error) {
      // Add a fallback service status if storage check completely fails
      services.push({
        name: 'Storage Service',
        configured: false,
        connected: false,
        error: 'Failed to check storage service status',
        configToReview: ['Check storage configuration']
      });
    }
    
    // Check email service (demonstrates extensibility)
    try {
      const emailStatus = await this.checkEmailStatus();
      services.push(emailStatus);
    } catch (error) {
      services.push({
        name: 'Email Service',
        configured: false,
        connected: false,
        error: 'Failed to check email service status'
      });
    }
    
    // TODO: Add other service checks here as they become available
    // Example:
    // try {
    //   const databaseStatus = await this.checkDatabaseStatus();
    //   services.push(databaseStatus);
    // } catch (error) {
    //   services.push({
    //     name: 'Database Service',
    //     configured: false,
    //     connected: false,
    //     error: 'Failed to check database service status'
    //   });
    // }
    
    return services;
  }
  
  // TODO: Add additional service check methods here
  // static async checkDatabaseStatus(): Promise<ServiceStatus> { ... }
}
