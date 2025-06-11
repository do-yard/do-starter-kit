import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import { createThemeFromConfig } from './ThemeRegistry';

/**
 * Static theme provider for public pages (login, signup, landing, etc.)
 *
 * This provider uses a fixed light theme without theme switching capabilities.
 * For protected pages with full theme customization, use the main Theme.tsx provider.
 *
 * Features:
 * - Always uses the 'default' theme
 * - Always uses 'light' mode
 * - No theme switching UI
 * - Optimized for public-facing pages
 */
export default function PublicThemeProvider({ children }: { children: React.ReactNode }) {
  const publicTheme = useMemo(() => createThemeFromConfig('modernize', 'light'), []);

  return (
    <ThemeProvider theme={publicTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
