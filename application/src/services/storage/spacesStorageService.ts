import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService } from './storage';
import { serverConfig } from '../../../settings';

/**
 * Service for interacting with DigitalOcean Spaces storage using the AWS S3 API.
 */
export class SpacesStorageService implements StorageService {
  private client: S3Client;
  private bucketName: string | undefined;
  private endpoint: string;

  constructor() {
    const missingVars = Object.entries(serverConfig.Spaces)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables for Spaces. Make sure you set these in your .env file: ${missingVars.join(', ')}`
      );
    }

    this.endpoint = `https://${serverConfig.Spaces.SPACES_REGION}.digitaloceanspaces.com`;
    this.bucketName = serverConfig.Spaces.SPACES_BUCKET_NAME;

    this.client = new S3Client({
      forcePathStyle: false,
      endpoint: this.endpoint,
      region: serverConfig.Spaces.SPACES_REGION || '',
      credentials: {
        accessKeyId: serverConfig.Spaces.SPACES_KEY_ID || '',
        secretAccessKey: serverConfig.Spaces.SPACES_KEY_SECRET || '',
      },
    });
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
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: this.getFilePath(userId, fileName),
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteFile(userId: string, fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: this.getFilePath(userId, fileName),
    });

    await this.client.send(command);
  }
}
