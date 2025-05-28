import { serverConfig } from 'settings/settings';
import { SpacesStorageService } from './spacesStorageService';

// Storage provider types
export type StorageProvider = 'Spaces';

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
