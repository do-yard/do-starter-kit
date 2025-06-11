'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import { Palette as PaletteIcon, LightMode, DarkMode } from '@mui/icons-material';
import { useThemeMode } from './Theme';
import { getAvailableThemes } from './ThemeRegistry';

/**
 * Theme picker component that allows users to select between different themes
 * and toggle between light/dark modes.
 */
export function ThemePicker() {
  const { mode, toggleMode, currentTheme, setCurrentTheme } = useThemeMode();
  const [availableThemes, setAvailableThemes] = useState<{ name: string; displayName: string }[]>(
    []
  );

  // Load available themes on mount
  useEffect(() => {
    const themes = getAvailableThemes();
    setAvailableThemes(themes);
  }, []);

  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    setCurrentTheme(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Theme Selector */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="theme-select-label">Theme</InputLabel>
        <Select
          labelId="theme-select-label"
          value={currentTheme}
          label="Theme"
          onChange={handleThemeChange}
          sx={{ fontSize: '0.875rem' }}
        >
          {availableThemes.map((theme) => (
            <MenuItem key={theme.name} value={theme.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon sx={{ fontSize: 16 }} />
                {theme.displayName}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Light/Dark Mode Toggle */}
      <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
        <IconButton onClick={toggleMode} color="inherit" size="small">
          {mode === 'dark' ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
