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
 * Interface for application health state.
 */
export interface HealthState {
  isHealthy: boolean;
  lastChecked: Date;
  services: ServiceStatus[];
}

/**
 * Service for checking configuration and connectivity status of various services.
 * Now includes built-in health state caching for optimal performance.
 */
export class StatusService {
  private static cachedHealthState: HealthState | null = null;
  private static isInitialized = false;

  /**
   * Initialize health checking at application startup.
   * This should be called once during app initialization.
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🔍 Initializing application health checks...');
    
    try {
      await this.performHealthCheck();
      this.isInitialized = true;
      
      if (this.cachedHealthState?.isHealthy) {
        console.log('✅ All services are healthy');
      } else {
        console.log('⚠️ Some services have issues');
      }    } catch (error) {
      console.error('❌ Failed to initialize health checks:', error);
      // Set unhealthy state as fallback
      this.cachedHealthState = {
        isHealthy: false,
        lastChecked: new Date(),
        services: []
      };
      this.isInitialized = true;
    }
  }

  /**
   * Check if the application is healthy (all services are working).
   * This is a fast, cached check suitable for middleware use.
   */
  static isApplicationHealthy(): boolean {
    if (!this.cachedHealthState) {
      // If not initialized, assume unhealthy for safety
      return false;
    }
    return this.cachedHealthState.isHealthy;
  }

  /**
   * Get the current health state for detailed reporting.
   */
  static getHealthState(): HealthState | null {
    return this.cachedHealthState;
  }

  /**
   * Force a fresh health check (bypasses cache).
   * Use this for the system status page refresh button.
   */
  static async forceHealthCheck(): Promise<HealthState> {
    await this.performHealthCheck();
    return this.cachedHealthState!;
  }  /**
   * Performs the actual health check and updates the cached state.
   */
  private static async performHealthCheck(): Promise<void> {
    try {
      const serviceStatuses = await this.checkAllServices();
      
      // Determine if the application is healthy (all services are working)
      const isHealthy = serviceStatuses.every(service => 
        service.configured && service.connected
      );

      this.cachedHealthState = {
        isHealthy,
        lastChecked: new Date(),
        services: serviceStatuses
      };
    } catch (error) {
      console.error('Failed to perform health check:', error);
      
      // Set unhealthy state on error
      this.cachedHealthState = {
        isHealthy: false,
        lastChecked: new Date(),
        services: [{
          name: 'Health Check System',
          configured: false,
          connected: false,
          error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }/**
   * Checks the status of storage service configuration and connectivity.
   * Uses the StorageService interface to check the current storage provider.
   * 
   * @returns {Promise<ServiceStatus>} The status of the storage service.
   */  static async checkStorageStatus(): Promise<ServiceStatus> {
    try {
      const storageService = createStorageService();
      
      // Get configuration status from the service (now includes the service name)
      return await storageService.checkConfiguration();
    } catch (error) {
      return {
        name: 'Storage Service',
        configured: false,
        connected: false,
        error: error instanceof Error
          ? `Failed to initialize storage service: ${error.message}` 
          : 'Failed to initialize storage service: Unknown error'
      };
    }
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
      } else {        status.error = 'Email service not configured';
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
    const storageStatus = await this.checkStorageStatus();
    services.push(storageStatus);
    
    // Check email service (demonstrates extensibility)
    const emailStatus = await this.checkEmailStatus();
    services.push(emailStatus);
    
    // TODO: Add other service checks here as they become available
    // Example:
    // const databaseStatus = await this.checkDatabaseStatus();
    // services.push(databaseStatus);
    
    return services;
  }
}
