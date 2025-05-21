import { serverConfig } from '../../../settings';
import { SpacesStorageService } from './SpacesStorageService';

// Storage provider types
export type StorageProvider = 'Spaces';

// Common interface for all storage providers
export interface StorageService {
  uploadFile(userId: string, file: File): Promise<string>;
  getFileUrl(userId: string, fileName: string, expiresIn?: number): Promise<string>;
  deleteFile(userId: string, fileName: string): Promise<void>;
}

// Factory function to create the appropriate storage service
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
