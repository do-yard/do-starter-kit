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
  private bucketName: string;

  constructor() {
    const accessKeyId = serverConfig.Spaces.accessKey;
    const secretAccessKey = serverConfig.Spaces.secretKey;
    const endpoint = serverConfig.Spaces.endpoint;
    const bucketName = serverConfig.Spaces.bucketName;
    const region = serverConfig.Spaces.region;

    if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint || !region) {
      throw new Error('Missing required environment variables for Spaces client configuration.');
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
