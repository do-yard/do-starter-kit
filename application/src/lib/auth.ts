import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';
import { createDatabaseClient } from 'services/database/database';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { hashPassword, verifyPassword } from 'helpers/hash';
import { MissingCredentialsError, InvalidCredentialsError, UserAlreadyExistsError } from './errors';
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
        throw new MissingCredentialsError();
      }

      const dbClient = createDatabaseClient();

      if (credentials?.isSignUp === 'true') {
        if (!credentials.name) {
          throw new InvalidCredentialsError();
        }

        const userExists = await dbClient.user.findByEmail(credentials.email as string);
        if (userExists) {
          throw new UserAlreadyExistsError();
        }

        const hashedPassword = await hashPassword(credentials.password as string);

        const user = await dbClient.user.create({
          name: credentials.name as string,
          email: credentials.email as string,
          image: null,
          passwordHash: hashedPassword,
          role: 'USER',
        });

        return user;
      }

      const user = await dbClient.user.findByEmail(credentials.email as string);
      if (!user || !user.passwordHash) {
        throw new InvalidCredentialsError();
      }

      const isValid = await verifyPassword(credentials.password as string, user.passwordHash);
      if (!isValid) {
        throw new InvalidCredentialsError();
      }

      return user;
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as User).role;
        token.email = (user as User).email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.email = token.email as string;
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

// Extend NextAuth types to include 'role' on session.user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    }
  }
}