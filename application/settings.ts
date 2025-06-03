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

export const spacesEnvironmentVariablesNames = {
  SPACES_KEY: 'SPACES_KEY',
  SPACES_SECRET: 'SPACES_SECRET',
  SPACES_BUCKETNAME: 'SPACES_BUCKETNAME',
  SPACES_REGION: 'SPACES_REGION',
  SPACES_ENDPOINT: 'SPACES_ENDPOINT',
}

export const serverConfig: ServerConfig = {
  databaseProvider: process.env.DATABASE_PROVIDER || 'Postgres',
  storageProvider: process.env.STORAGE_PROVIDER || 'Spaces',
  emailProvider: process.env.EMAIL_PROVIDER || 'Resend',
  Spaces: {
    accessKey: process.env[spacesEnvironmentVariablesNames.SPACES_KEY],
    secretKey: process.env[spacesEnvironmentVariablesNames.SPACES_SECRET],
    bucketName: process.env[spacesEnvironmentVariablesNames.SPACES_BUCKETNAME],
    region: process.env[spacesEnvironmentVariablesNames.SPACES_REGION],
    endpoint: process.env[spacesEnvironmentVariablesNames.SPACES_ENDPOINT],
  },
  Resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_EMAIL_SENDER
  }
};