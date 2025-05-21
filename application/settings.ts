export interface ServerConfig {
  databaseProvider: string;
}

export const serverConfig: ServerConfig = {
  databaseProvider: process.env.DATABASE_PROVIDER || 'Postgres',
};
