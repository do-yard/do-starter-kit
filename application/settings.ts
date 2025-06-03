export interface ServerConfig {
  databaseProvider: string;
  storageProvider: string;
  emailProvider: string;
  Spaces: {
    accessKey?: string;
    secretKey?: string;
    bucketName?: string;
    region?: string;
    endpoint?: string;
  };
  Resend: {
    apiKey?: string;
    fromEmail?: string;
  };
}

export const serverConfig: ServerConfig = {
  databaseProvider: process.env.DATABASE_PROVIDER || 'Postgres',
  storageProvider: process.env.STORAGE_PROVIDER || 'Spaces',
  emailProvider: process.env.EMAIL_PROVIDER || 'Resend',
  Spaces: {
    accessKey: process.env.SPACES_ACCESS_KEY,
    secretKey: process.env.SPACES_KEY_SECRET,
    bucketName: process.env.SPACES_BUCKET_NAME,
    region: process.env.SPACES_REGION,
  },
  Resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_EMAIL_SENDER,
  },
};
