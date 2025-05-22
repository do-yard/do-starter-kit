import { DatabaseClient } from './database';
import { prisma } from '../../lib/prisma';
import { Subscription, Note, User, UserWithSubscriptions } from 'types';

export class SqlDatabaseService implements DatabaseClient {
  // User operations
  user = {
    findById: async (id: string): Promise<User | null> => {
      return prisma.user.findUnique({ where: { id } });
    },
    findByEmail: async (email: string): Promise<User | null> => {
      return prisma.user.findUnique({ where: { email } });
    },
    findByEmailAndPassword: async (email: string, passwordHash: string): Promise<User | null> => {
      return prisma.user.findFirst({ where: { email, passwordHash } });
    },
    findAll: async (): Promise<UserWithSubscriptions[]> => {
      return prisma.user.findMany({
        include: { subscriptions: true },
        orderBy: { name: 'asc' },
      });
    },
    create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
      const newUser = await prisma.user.create({ data: user });
      await prisma.subscription.create({
        data: {
          userId: newUser.id,
          plan: 'FREE',
          status: 'ACTIVE',
        },
      });

      return newUser;
    },
    update: async (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> => {
      return prisma.user.update({ where: { id }, data: user });
    },
    delete: async (id: string): Promise<void> => {
      await prisma.user.delete({ where: { id } });
    },
  };

  // Subscription operations
  subscription = {
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
      id: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ): Promise<Subscription> => {
      return prisma.subscription.update({ where: { id }, data: subscription });
    },
    delete: async (id: string): Promise<void> => {
      await prisma.subscription.delete({ where: { id } });
    },
  };

  // Note operations
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
