'use client';
import { UserProvider } from './UserContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <UserProvider>{children}</UserProvider>;
};
