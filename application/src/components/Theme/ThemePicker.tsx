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
  useMediaQuery,
  useTheme,
  Fab,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  LightMode,
  DarkMode,
  Brightness6 as ThemeIcon,
} from '@mui/icons-material';
import { useThemeMode } from './Theme';
import { getAvailableThemes } from './ThemeRegistry';

/**
 * Theme picker component that allows users to select between different themes
 * and toggle between light/dark modes. Responsive design with mobile FAB.
 */
export function ThemePicker() {
  const { mode, toggleMode, currentTheme, setCurrentTheme } = useThemeMode();
  const [availableThemes, setAvailableThemes] = useState<{ name: string; displayName: string }[]>(
    []
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMenuOpen = Boolean(anchorEl);

  // Load available themes on mount
  useEffect(() => {
    try {
      const themes = getAvailableThemes();
      setAvailableThemes(themes);
    } catch (error) {
      console.warn('Failed to load available themes:', error);
      // Set a fallback theme list
      setAvailableThemes([
        { name: 'modernize', displayName: 'Modernize' },
        { name: 'minimalist', displayName: 'Minimalist' },
      ]);
    }
  }, []);

  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    setCurrentTheme(event.target.value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (themeName: string) => {
    setCurrentTheme(themeName);
    handleMenuClose();
  };

  const handleModeToggle = () => {
    toggleMode();
    handleMenuClose();
  };

  // Mobile version with FAB and Menu
  if (isMobile) {
    return (
      <>
        <Fab
          color="primary"
          size="small"
          onClick={handleMenuOpen}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1300,
            width: 48,
            height: 48,
          }}
        >
          <ThemeIcon />
        </Fab>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
            },
          }}
        >
          {/* Light/Dark Mode Toggle */}
          <MenuItem onClick={handleModeToggle}>
            <ListItemIcon>
              {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </ListItemIcon>
            <ListItemText>Switch to {mode === 'light' ? 'dark' : 'light'} mode</ListItemText>
          </MenuItem>

          <Divider />

          {/* Theme Options */}
          {availableThemes.map((theme) => (
            <MenuItem
              key={theme.name}
              onClick={() => handleThemeSelect(theme.name)}
              selected={currentTheme === theme.name}
            >
              <ListItemIcon>
                <PaletteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{theme.displayName}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Desktop version with Select and IconButton
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
