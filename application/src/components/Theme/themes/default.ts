import { BaseThemeConfig } from '../ThemeRegistry';

export const defaultTheme: BaseThemeConfig = {
  name: 'default',
  displayName: 'Default',
  palette: {
    light: {
      mode: 'light',
      primary: {
        main: '#0061EB',
      },
      background: {
        default: '#ffffff',
        paper: '#ffffff',
      },
    },
    dark: {
      mode: 'dark',
      primary: {
        main: '#0061EB',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '16px',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '48px',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: 'outlined',
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
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
};
