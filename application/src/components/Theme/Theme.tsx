'use client';

import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useMemo, useState, useContext, createContext, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '16px',
    color: '#fff',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '48px',
    color: '#fff',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  subtitle1: {
    fontSize: '1.25rem',
    marginBottom: '32px',
    color: '#6b7280',
  },
};

// Define component overrides
const components: ThemeOptions['components'] = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      contained: {
        textTransform: 'none',
        fontWeight: 600,
        height: 44,
        paddingLeft: 32,
        paddingRight: 32,
      },
    },
  },
};

// Theme context for mode switching
interface ThemeModeContextProps {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}
const ThemeModeContext = createContext<ThemeModeContextProps | undefined>(undefined);

/**
 * Custom hook to access the theme mode context.
 */
export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}

/**
 * Theme toggle button component for switching between light and dark mode.
 */
export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  return (
    <IconButton onClick={toggleMode} color="inherit" aria-label="Toggle dark/light mode">
      {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}

/**
 * Provides the Material UI theme and color mode context to the application.
 */
export function MaterialThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light'); // Always start with 'light' for SSR

  // On mount, sync mode with localStorage (SSR-safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
      if (stored && stored !== mode) setMode(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', mode);
    }
  }, [mode]);

  const palette = useMemo(
    () => ({
      mode: mode,
      primary: {
        main: '#0061EB',
      },
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider
        theme={useMemo(
          () =>
            createTheme({
              palette,
              typography: typography as ThemeOptions['typography'],
              components: components as ThemeOptions['components'],
            }),
          [palette]
        )}
      >
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

/**
 * Provides Material UI with a static light theme (no dark mode support).
 */
export function MaterialLightProvider({ children }: { children: React.ReactNode }) {
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
