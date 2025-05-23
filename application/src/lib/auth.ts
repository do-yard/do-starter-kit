import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';
import { createDatabaseClient } from 'services/database/database';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { hashPassword, verifyPassword } from 'helpers/hash';
import { MissingCredentialsError, InvalidCredentialsError, UserAlreadyExistsError } from './errors';
import { UserRole } from 'types';

const getRedirectPathForRole = (role: string): string => {
  switch (role) {
    case 'USER':
    default:
      return '/dashboard';
  }
};

const hasRole = (userOrToken: unknown): userOrToken is { id: string; role: UserRole } => {
  return (
    typeof userOrToken === 'object' &&
    userOrToken !== null &&
    'role' in userOrToken &&
    'id' in userOrToken
  );
};

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

      return { ...user, redirectPath: getRedirectPathForRole(user.role) };
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user && hasRole(user)) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && hasRole(token)) {
        session.user.id = token.id;
        session.user.role = token.role;
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
