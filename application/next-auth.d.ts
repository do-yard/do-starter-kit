import { UserRole } from 'types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
