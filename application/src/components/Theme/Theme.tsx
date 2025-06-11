'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useMemo, useState, useContext, createContext, useEffect } from 'react';
import { createThemeFromConfig } from './ThemeRegistry';

// Theme context for mode and theme switching
interface ThemeModeContextProps {
  mode: 'light' | 'dark';
  toggleMode: () => void;
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
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
 * Provides the Material UI theme and color mode context to the application.
 */
export default function MaterialThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light'); // Always start with 'light' for SSR
  const [currentTheme, setCurrentTheme] = useState('default'); // Default theme

  // On mount, sync with localStorage (SSR-safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
      const storedTheme = localStorage.getItem('currentTheme') || 'default';

      if (storedMode && storedMode !== mode) setMode(storedMode);
      if (storedTheme !== currentTheme) setCurrentTheme(storedTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSetCurrentTheme = (theme: string) => {
    setCurrentTheme(theme);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', mode);
      localStorage.setItem('currentTheme', currentTheme);
    }
  }, [mode, currentTheme]);
  const theme = useMemo(() => {
    return createThemeFromConfig(currentTheme, mode);
  }, [currentTheme, mode]);

  return (
    <ThemeModeContext.Provider
      value={{
        mode,
        toggleMode,
        currentTheme,
        setCurrentTheme: handleSetCurrentTheme,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
