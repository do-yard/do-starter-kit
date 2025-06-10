import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';
import { createDatabaseService } from 'services/database/databaseFactory';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '../prisma';
import { hashPassword, verifyPassword } from 'helpers/hash';
import { User, UserRole } from 'types';
import { MissingCredentialsError, InvalidCredentialsError, UserAlreadyExistsError } from './errors';
import { USER_ROLES } from './roles';

const hasRole = (user: unknown): user is { id: string; role: UserRole } => {
  return typeof user === 'object' && user !== null && 'role' in user && 'id' in user;
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

      const dbClient = await createDatabaseService();

      if (credentials?.isSignUp === 'true') {
        if (!credentials.name) {
          throw new InvalidCredentialsError();
        }

        const userCount = await dbClient.user.count();
        const isFirstUser = userCount === 0;

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
          role: isFirstUser ? USER_ROLES.ADMIN : USER_ROLES.USER,
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
