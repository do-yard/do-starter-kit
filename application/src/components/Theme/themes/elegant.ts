import { BaseThemeConfig } from '../ThemeRegistry';

export const elegantTheme: BaseThemeConfig = {
  name: 'elegant',
  displayName: 'Elegant',
  palette: {
    light: {
      mode: 'light',
      primary: {
        main: '#8B5CF6',
        light: '#F3E8FF',
        dark: '#7C3AED',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#EC4899',
        light: '#FCE7F3',
        dark: '#DB2777',
        contrastText: '#ffffff',
      },
      success: {
        main: '#10B981',
        light: '#D1FAE5',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      error: {
        main: '#EF4444',
        light: '#FEE2E2',
        dark: '#DC2626',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#F59E0B',
        light: '#FEF3C7',
        dark: '#D97706',
        contrastText: '#ffffff',
      },
      grey: {
        100: '#F9FAFB',
        200: '#F3F4F6',
        300: '#E5E7EB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#374151',
      },
      text: {
        primary: '#111827',
        secondary: '#6B7280',
      },
      background: {
        default: '#FEFEFE',
        paper: '#FFFFFF',
      },
      divider: '#E5E7EB',
    },
    dark: {
      mode: 'dark',
      primary: {
        main: '#A78BFA',
        light: '#F3E8FF',
        dark: '#8B5CF6',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#F472B6',
        light: '#FCE7F3',
        dark: '#EC4899',
        contrastText: '#ffffff',
      },
      success: {
        main: '#34D399',
        light: '#D1FAE5',
        dark: '#10B981',
        contrastText: '#ffffff',
      },
      error: {
        main: '#F87171',
        light: '#FEE2E2',
        dark: '#EF4444',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FBBF24',
        light: '#FEF3C7',
        dark: '#F59E0B',
        contrastText: '#ffffff',
      },
      grey: {
        100: '#1F2937',
        200: '#374151',
        300: '#4B5563',
        400: '#6B7280',
        500: '#9CA3AF',
        600: '#D1D5DB',
      },
      text: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
      },
      background: {
        default: '#0F172A',
        paper: '#1E293B',
      },
      divider: '#4B5563',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
  },
};
