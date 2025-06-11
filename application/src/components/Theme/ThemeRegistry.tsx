'use client';

import { createTheme, ThemeOptions, PaletteMode } from '@mui/material/styles';

// Import all themes from the themes directory
import { defaultTheme } from './themes/default';
import { modernizeTheme } from './themes/modernize';
import { material3Theme } from './themes/material3';
import { elegantTheme } from './themes/elegant';

// Base theme configurations
export interface BaseThemeConfig {
  name: string;
  displayName: string;
  palette: {
    light: ThemeOptions['palette'];
    dark: ThemeOptions['palette'];
  };
  typography?: ThemeOptions['typography'];
  components?: ThemeOptions['components'];
}

// Theme registry - automatically populated from theme imports
// To add a new theme:
// 1. Create a new .ts file in the themes/ directory
// 2. Export a theme object with BaseThemeConfig interface
// 3. Import it above and add it to this registry
export const themeRegistry: Record<string, BaseThemeConfig> = {
  [defaultTheme.name]: defaultTheme,
  [modernizeTheme.name]: modernizeTheme,
  [material3Theme.name]: material3Theme,
  [elegantTheme.name]: elegantTheme,
};

// Function to create theme with mode
/**
 * Creates a Material UI theme from configuration and mode
 * @param themeName - The name of the theme to create
 * @param mode - The palette mode (light or dark)
 * @returns A Material UI theme instance
 */
export function createThemeFromConfig(themeName: string, mode: PaletteMode) {
  const config = themeRegistry[themeName] || themeRegistry.default;

  if (!config) {
    console.warn(`Theme '${themeName}' not found. Using fallback theme.`);
    // Create a minimal fallback theme
    return createTheme({
      palette: {
        mode,
        primary: { main: '#0061EB' },
      },
    });
  }

  const palette = config.palette[mode];

  return createTheme({
    palette,
    typography: config.typography,
    components: config.components,
  });
}

// Get available theme options
/**
 * Gets the list of available themes
 * @returns Array of theme objects with name and display name
 */
export function getAvailableThemes() {
  return Object.values(themeRegistry).map((theme) => ({
    name: theme.name,
    displayName: theme.displayName,
  }));
}
