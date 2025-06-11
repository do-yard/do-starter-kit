import { BaseThemeConfig } from '../ThemeRegistry';

export const modernizeTheme: BaseThemeConfig = {
  name: 'modernize',
  displayName: 'Modernize',
  palette: {
    light: {
      mode: 'light',
      primary: {
        main: '#5D87FF',
        light: '#ECF2FF',
        dark: '#4570EA',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#49BEFF',
        light: '#E8F7FF',
        dark: '#23afdb',
        contrastText: '#ffffff',
      },
      success: {
        main: '#13DEB9',
        light: '#E6FFFA',
        dark: '#02b3a9',
        contrastText: '#ffffff',
      },
      error: {
        main: '#FA896B',
        light: '#FDEDE8',
        dark: '#f3704d',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FFAE1F',
        light: '#FEF5E5',
        dark: '#ae8e59',
        contrastText: '#ffffff',
      },
      grey: {
        100: '#F2F6FA',
        200: '#EAEFF4',
        300: '#DFE5EF',
        400: '#7C8FAC',
        500: '#5A6A85',
        600: '#2A3547',
      },
      text: {
        primary: '#2A3547',
        secondary: '#5A6A85',
      },
      background: {
        default: '#fafbfb',
        paper: '#ffffff',
      },
      divider: '#e5eaef',
    },
    dark: {
      mode: 'dark',
      primary: {
        main: '#5D87FF',
        light: '#ECF2FF',
        dark: '#4570EA',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#49BEFF',
        light: '#1a365d',
        dark: '#23afdb',
        contrastText: '#ffffff',
      },
      success: {
        main: '#13DEB9',
        light: '#065f46',
        dark: '#02b3a9',
        contrastText: '#ffffff',
      },
      error: {
        main: '#FA896B',
        light: '#7f1d1d',
        dark: '#f3704d',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FFAE1F',
        light: '#78350f',
        dark: '#ae8e59',
        contrastText: '#ffffff',
      },
      grey: {
        100: '#1a202c',
        200: '#2d3748',
        300: '#4a5568',
        400: '#718096',
        500: '#a0aec0',
        600: '#e2e8f0',
      },
      text: {
        primary: '#f7fafc',
        secondary: '#cbd5e0',
      },
      background: {
        default: '#0f172a',
        paper: '#1e293b',
      },
      divider: '#4a5568',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: '2.75rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: '2.25rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: '1.6rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '7px',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '7px',
          boxShadow: 'rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '7px',
          },
        },
      },
    },
  },
};
