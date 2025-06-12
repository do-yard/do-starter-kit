import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';
import { createDatabaseService } from 'services/database/databaseFactory';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '../prisma';
import { verifyPassword } from 'helpers/hash';
import { User, UserRole } from 'types';
import { InvalidCredentialsError } from './errors';

const hasRole = (user: unknown): user is { id: string; role: UserRole } => {
  return typeof user === 'object' && user !== null && 'role' in user && 'id' in user;
};

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      try {
        if (!credentials.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

      const dbClient = await createDatabaseService();

        const user = await dbClient.user.findByEmail(credentials.email as string);
        if (!user || !user.passwordHash) {
          throw new Error('User not found or password hash is missing');
        }

        if (user.emailVerified === false) {
          throw new Error('Email not verified');
        }

        const isValid = await verifyPassword(credentials.password as string, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return user;
      } catch (error) {
        throw new InvalidCredentialsError((error as Error).message);
      }
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user && hasRole(user)) {
        token.id = user.id;
        token.role = (user as User).role;
        token.email = (user as User).email;
      }

      if (trigger === 'update') {
        token.image = session.user.image;
        token.name = session.user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && hasRole(token)) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }

      session.user.email = token.email as string;

      if (token.image) {
        session.user.image = token.image as string;
      }

      if (token.name) {
        session.user.name = token.name as string;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    newUser: '/signup',
  },
});
