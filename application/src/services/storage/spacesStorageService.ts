import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService, StorageConfigStatus } from './storage';
import { serverConfig } from '../../../settings';

/**
 * Service for interacting with DigitalOcean Spaces storage using the AWS S3 API.
 */
export class SpacesStorageService implements StorageService {
  private client: S3Client | null = null;
  private bucketName: string = '';
  private isConfigured: boolean = false;
  private configError: string = '';
  
  // Required config items with their corresponding env var names
  private static requiredConfig = {
    'accessKey': 'SPACES_KEY',
    'secretKey': 'SPACES_SECRET',
    'bucketName': 'SPACES_BUCKETNAME',
    'endpoint': 'SPACES_ENDPOINT',
    'region': 'SPACES_REGION'
  };

  constructor() {
    this.initializeClient();
  }
  
  /**
   * Initializes the S3 client based on the configuration.
   * Sets isConfigured flag and configError message if applicable.
   */
  private initializeClient(): void {
    try {
      const accessKeyId = serverConfig.Spaces.accessKey;
      const secretAccessKey = serverConfig.Spaces.secretKey;
      const endpoint = serverConfig.Spaces.endpoint;
      const bucketName = serverConfig.Spaces.bucketName;
      const region = serverConfig.Spaces.region;
      
      if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint || !region) {
        this.isConfigured = false;
        this.configError = 'Missing required environment variables for Spaces client configuration.';
        return;
      }

      this.bucketName = bucketName;
      this.client = new S3Client({
        forcePathStyle: false, // Configures to use subdomain/virtual calling format.
        endpoint,
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isConfigured = true;
    } catch (error) {
      this.isConfigured = false;
      this.configError = error instanceof Error ? error.message : 'Unknown error initializing Spaces client';
    }
  }

  private getFilePath(userId: string, fileName: string): string {
    return `uploads/${userId}/${fileName}`;
  }
  async uploadFile(
    userId: string,
    fileName: string,
    file: File,
    { ACL = 'private' }: { ACL?: 'public-read' | 'private' }
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Storage client not initialized. Check configuration.');
    }
    
    const fileBuffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: this.getFilePath(userId, fileName),
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
      ACL,
    });

    await this.client.send(command);
    return fileName;
  }

  async getFileUrl(userId: string, fileName: string, expiresIn: number = 3600): Promise<string> {
    if (!this.client) {
      throw new Error('Storage client not initialized. Check configuration.');
    }
    
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: this.getFilePath(userId, fileName),
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }
  
  async deleteFile(userId: string, fileName: string): Promise<void> {
    if (!this.client) {
      throw new Error('Storage client not initialized. Check configuration.');
    }
    
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: this.getFilePath(userId, fileName),
    });

    await this.client.send(command);
  }
  
  /**
   * Checks if the Spaces service is properly configured and accessible.
   * Uses HeadBucketCommand to verify bucket existence and access permissions.
   * 
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise.
   */
  async checkConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      return false;
    }
    
    try {
      const { HeadBucketCommand } = await import('@aws-sdk/client-s3');
      const command = new HeadBucketCommand({
        Bucket: this.bucketName,
      });
      
      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('Failed to connect to storage service:', error);
      return false;
    }
  }
  
  /**
   * Checks if the Spaces storage service configuration is valid.
   * Inspects environment variables and configuration values.
   * 
   * @returns {StorageConfigStatus} Configuration status object.
   */  checkConfiguration(): StorageConfigStatus {
    const configValues = {
      accessKey: serverConfig.Spaces.accessKey,
      secretKey: serverConfig.Spaces.secretKey,
      bucketName: serverConfig.Spaces.bucketName,
      endpoint: serverConfig.Spaces.endpoint,
      region: serverConfig.Spaces.region
    };
    
    // Find missing configuration items
    const missingConfig = Object.entries(configValues)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([key, _]) => SpacesStorageService.requiredConfig[key as keyof typeof SpacesStorageService.requiredConfig]);
    
    return {
      configured: this.isConfigured && missingConfig.length === 0,
      missingConfig: missingConfig.length > 0 ? missingConfig : undefined,
      error: this.configError || undefined
    };
  }
  
  /**
   * Gets the storage provider name.
   * @returns {string} The name of the storage provider.
   */
  getProviderName(): string {
    return 'DigitalOcean Spaces';
  }
}
