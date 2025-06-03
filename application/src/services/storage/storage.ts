import { serverConfig } from '../../../settings';
import { SpacesStorageService } from './spacesStorageService';

// Storage provider types
export type StorageProvider = 'Spaces';

/**
 * Interface for storage service configuration status
 */
export interface StorageConfigStatus {
  configured: boolean;
  missingConfig?: string[];
  error?: string;
}

// Common interface for all storage providers
export interface StorageService {
  uploadFile(
    userId: string,
    fileName: string,
    file: File,
    options?: { ACL?: 'public-read' | 'private' }
  ): Promise<string>;
  getFileUrl(userId: string, fileName: string, expiresIn?: number): Promise<string>;
  deleteFile(userId: string, fileName: string): Promise<void>;
  
  /**
   * Checks if the storage service is properly configured and accessible.
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise.
   */
  checkConnection(): Promise<boolean>;
  
  /**
   * Checks if the storage service configuration is valid.
   * @returns {StorageConfigStatus} Configuration status object.
   */
  checkConfiguration(): StorageConfigStatus;
  
  /**
   * Gets the storage provider name.
   * @returns {string} The name of the storage provider.
   */
  getProviderName(): string;
}

/**
 * Factory function to create and return the appropriate storage service based on configuration.
 */
export function createStorageService(): StorageService {
  const storageProvider = serverConfig.storageProvider;
  switch (storageProvider) {
    // Add more providers here in the future
    // case 'AZURE':
    //   return new AzureStorageService();
    case 'Spaces':
    default:
      return new SpacesStorageService();
  }
}
