import { UserRole } from 'types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      image: string | null;
    };
  }
}
