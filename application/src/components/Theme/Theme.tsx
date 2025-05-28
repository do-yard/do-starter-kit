'use client';

import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useMemo, useState, useContext, createContext, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

// Define color palette
const colors = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#EFC3CA',
    contrastText: '#fff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#fff',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    dark: '#111827',       // Dark text for headings
    medium: '#4b5563',     // Medium gray for body text
    light: '#6b7280',      // Light gray for secondary text
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#fff',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
};

// Define typography
const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '16px', // 2 * 8px
    color: '#fff', // Used in hero section
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700, // Was 500, now matches usage
    marginBottom: '48px', // 6 * 8px
    color: '#fff', // Default, can be overridden
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
    fontWeight: 600, // Matches usage in cards
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
  subtitle1: {
    fontSize: '1.25rem',
    marginBottom: '32px', // 4 * 8px
    color: '#6b7280', // text.light
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
        paddingLeft: 32, // px: 4
        paddingRight: 32,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        border: 'none'
      },
    },
  }
};

// Theme context for mode switching
interface ThemeModeContextProps {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}
const ThemeModeContext = createContext<ThemeModeContextProps | undefined>(undefined);

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  return (
    <IconButton onClick={toggleMode} color="inherit" aria-label="Toggle dark/light mode">
      {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}

// Create the theme
export default function MaterialThemeProvider({ children }: { children: React.ReactNode }) {
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

  // Only spread palette-relevant keys
  const palette = useMemo(() => ({
    mode, 
    primary: mode === 'light' ? {
      main: '#0061EB'
    } : { main: '#76A4E6' }, // Example primary color
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
    grey: colors.grey,
    background: mode === 'dark'
      ? { default: colors.grey[900], paper: colors.grey[800] }
      : colors.background,
    text: mode === 'dark'
      ? {
          primary: '#fff',
          secondary: colors.grey[700],
          disabled: colors.grey[600],
          dark: '#fff',
          medium: colors.grey[400],
          light: colors.grey[500],
        }
      : colors.text
  }), [mode]);

  // Add a tooltip to the toggle button (optional, but recommended for accessibility)
  // This is handled in ThemeToggle, but you may want to use Tooltip from MUI if desired.

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={useMemo(() => createTheme({
        palette,
        typography: typography as ThemeOptions['typography'],
        components: components as ThemeOptions['components'],
        spacing: 8,
      }), [palette])}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
