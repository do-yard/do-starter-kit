import { DatabaseClient } from './database';
import { prisma } from '../../lib/prisma';
import { Subscription, Note, User, UserWithSubscriptions, SubscriptionStatus } from 'types';

/**
 * Service for interacting with the SQL database using Prisma.
 */
export class SqlDatabaseService implements DatabaseClient {
  user = {
    findById: async (id: string) => {
      return prisma.user.findUnique({ where: { id } });
    },
    findByEmail: async (email: string) => {
      return prisma.user.findUnique({ where: { email } });
    },
    findByEmailAndPassword: async (email: string, passwordHash: string) => {
      return prisma.user.findFirst({ where: { email, passwordHash } });
    },
    findAll: async (options?: {
      page?: number;
      pageSize?: number;
      searchName?: string;
      filterPlan?: string;
      filterStatus?: string;
    }): Promise<{ users: UserWithSubscriptions[]; total: number }> => {
      const page = options?.page || 1;
      const pageSize = options?.pageSize || 10;
      const skip = (page - 1) * pageSize;
      const where: Record<string, unknown> = {};
      if (options?.searchName) {
        where.name = { contains: options.searchName, mode: 'insensitive' };
      }
      if (options?.filterPlan || options?.filterStatus) {
        where.subscriptions = { some: {} };
        if (options.filterPlan) {
          (where.subscriptions as { some: Record<string, unknown> }).some.plan = options.filterPlan;
        }
        if (options.filterStatus) {
          (where.subscriptions as { some: Record<string, unknown> }).some.status =
            options.filterStatus;
        }
      }
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: { subscription: true },
          orderBy: { name: 'asc' },
          skip,
          take: pageSize,
        }),
        prisma.user.count({ where }),
      ]);
      return { users, total };
    },
    create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
      const newUser = await prisma.user.create({ data: user });
      return newUser;
    },
    update: async (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> => {
      return prisma.user.update({ where: { id }, data: user });
    },
    delete: async (id: string): Promise<void> => {
      await prisma.user.delete({ where: { id } });
    },
    count: async (): Promise<number> => {
      return prisma.user.count();
    },
  };
  subscription = {
    findByUserAndStatus: async (
      userId: string,
      status: SubscriptionStatus
    ): Promise<Subscription | null> => {
      return prisma.subscription.findFirst({
        where: { userId, status },
      });
    },
    findById: async (id: string): Promise<Subscription | null> => {
      return prisma.subscription.findUnique({ where: { id } });
    },
    findByUserId: async (userId: string): Promise<Subscription[]> => {
      return prisma.subscription.findMany({ where: { userId } });
    },
    create: async (subscription: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> => {
      return prisma.subscription.create({ data: subscription });
    },
    update: async (
      userId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ): Promise<Subscription> => {
      return prisma.subscription.update({ where: { userId }, data: subscription });
    },
    updateByCustomerId: async (
      customerId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ): Promise<Subscription> => {
      const existing = await prisma.subscription.findFirst({ where: { customerId } });
      if (!existing) throw new Error('Subscription not found for customerId');
      return prisma.subscription.update({ where: { id: existing.id }, data: subscription });
    },
    delete: async (id: string): Promise<void> => {
      await prisma.subscription.delete({ where: { id } });
    },
  };
  note = {
    findById: async (id: string): Promise<Note | null> => {
      return prisma.note.findUnique({ where: { id } });
    },
    findByUserId: async (userId: string): Promise<Note[]> => {
      return prisma.note.findMany({ where: { userId } });
    },
    create: async (note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> => {
      return prisma.note.create({ data: note });
    },
    update: async (id: string, note: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note> => {
      return prisma.note.update({ where: { id }, data: note });
    },
    delete: async (id: string): Promise<void> => {
      await prisma.note.delete({ where: { id } });
    },
  };
}
