'use client';
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from './UserContext';
import MaterialThemeProvider from 'components/Theme/Theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <UserProvider>
          <MaterialThemeProvider>{children}</MaterialThemeProvider>
        </UserProvider>
      </AppRouterCacheProvider>
    </SessionProvider>
  );
};
