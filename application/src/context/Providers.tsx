'use client';
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from './UserContext';
import MaterialThemeProvider from 'components/Theme/Theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { NavigatingProvider } from './Navigation';

/**
 * Wrapper global que agrupa todos los context providers usados en la aplicación.
 * Incluye sesión, tema, usuario y navegación.
 *
 * @param children - Árbol de componentes que recibirán estos contextos.
 */
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <UserProvider>
          <NavigatingProvider>
            <MaterialThemeProvider>{children}</MaterialThemeProvider>
          </NavigatingProvider>
        </UserProvider>
      </AppRouterCacheProvider>
    </SessionProvider>
  );
};
