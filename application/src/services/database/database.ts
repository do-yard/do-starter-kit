import { serverConfig } from '../../../settings';
import { Note, Subscription, User, UserWithSubscriptions } from 'types';
import { SqlDatabaseService } from './sqlDatabaseService';

export type DatabaseProvider = 'Postgres';

export type QueryParams = unknown[];

export interface DatabaseClient {
  user: {
    findById: (id: string) => Promise<User | null>;
    findByEmail: (email: string) => Promise<User | null>;
    findByEmailAndPassword: (email: string, passwordHash: string) => Promise<User | null>;
    findAll: (options?: {
      page?: number;
      pageSize?: number;
      searchName?: string;
      filterPlan?: string;
      filterStatus?: string;
    }) => Promise<{ users: UserWithSubscriptions[]; total: number }>;
    create: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
    update: (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User>;
    delete: (id: string) => Promise<void>;
    count: () => Promise<number>;
  }
  subscription: {
    findById: (id: string) => Promise<Subscription | null>;
    findByUserId: (userId: string) => Promise<Subscription[]>;
    create: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => Promise<Subscription>;
    update: (
      id: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ) => Promise<Subscription>;
    delete: (id: string) => Promise<void>;
  };
  note: {
    findById: (id: string) => Promise<Note | null>;
    findByUserId: (userId: string) => Promise<Note[]>;
    create: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<Note>;
    update: (id: string, note: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<Note>;
    delete: (id: string) => Promise<void>;
  };
}

/**
 * Factory function to create and return the appropriate database client based on the configured provider.
 */
export function createDatabaseClient(): DatabaseClient {
  const databaseProvider = serverConfig.databaseProvider;

  switch (databaseProvider) {
    // Add more providers here in the future
    // case 'MySQL':
    //   return new MySqlDbService();
    case 'Postgres':
    default:
      return new SqlDatabaseService();
  }
}