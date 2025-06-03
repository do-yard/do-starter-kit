import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import { components, typography } from './Theme';

/**
 * Provides Material UI with a static light theme (no dark mode support).
 */
export function MaterialLightThemeProvider({ children }: { children: React.ReactNode }) {
  const lightTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#0061EB' },
        },
        typography: typography as ThemeOptions['typography'],
        components: components as ThemeOptions['components'],
      }),
    []
  );

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
