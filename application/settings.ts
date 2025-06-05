export interface ServerConfig {
  databaseProvider: string;
  storageProvider: string;
  emailProvider: string;
  Spaces: {
    SPACES_KEY_ID?: string;
    SPACES_KEY_SECRET?: string;
    SPACES_BUCKET_NAME?: string;
    SPACES_REGION?: string;
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
    SPACES_KEY_ID: process.env.SPACES_KEY_ID,
    SPACES_KEY_SECRET: process.env.SPACES_KEY_SECRET,
    SPACES_BUCKET_NAME: process.env.SPACES_BUCKET_NAME,
    SPACES_REGION: process.env.SPACES_REGION,
  },
  Resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_EMAIL_SENDER,
  },
};
