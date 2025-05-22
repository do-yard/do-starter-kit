import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';
import { createDatabaseClient } from 'services/database/database';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { hashPassword, verifyPassword } from 'helpers/hash';
import { User } from 'types';

const providers: Provider[] = [
  Credentials({
    credentials: {
      name: {},
      email: {},
      password: {},
      isSignUp: {},
    },
    authorize: async (credentials) => {
      if (!credentials.email || !credentials.password) {
        return null;
      }

      const dbClient = createDatabaseClient();

      // Sign Up a new user
      if (credentials?.isSignUp === 'true') {
        if (!credentials.name) {
          return null;
        }

        const userExists = await dbClient.user.findByEmail(credentials.email as string);
        if (userExists) {
          return null;
        }

        const hashedPassword = await hashPassword(credentials.password as string);

        const user: Omit<User, 'id' | 'createdAt'> = {
          name: credentials.name as string,
          image: null,
          email: credentials.email as string,
          passwordHash: hashedPassword,
          role: 'USER',
        };

        const newUser = await dbClient.user.create(user);
        return newUser;
      }

      // Login existing user
      const user = await dbClient.user.findByEmail(credentials.email as string);
      if (!user || !user.passwordHash) return null;

      const isValid = await verifyPassword(credentials.password as string, user.passwordHash);
      if (!isValid) return null;

      return user;
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id; // Add user ID to the token
      }

      if (trigger === 'update') {
        token.image = session.user.image;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;

      if (token.image) {
        session.user.image = token.image as string;
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
