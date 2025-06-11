import { BaseThemeConfig } from '../ThemeRegistry';

export const material3Theme: BaseThemeConfig = {
  name: 'material3',
  displayName: 'Material 3',
  palette: {
    light: {
      mode: 'light',
      primary: {
        main: '#6750A4',
        light: '#EADDFF',
        dark: '#21005D',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#625B71',
        light: '#E8DEF8',
        dark: '#1D192B',
        contrastText: '#ffffff',
      },
      success: {
        main: '#006D3C',
        light: '#54E098',
        dark: '#00452A',
        contrastText: '#ffffff',
      },
      error: {
        main: '#BA1A1A',
        light: '#FFDAD6',
        dark: '#410E0B',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#7D5260',
        light: '#FFD8E4',
        dark: '#31111D',
        contrastText: '#ffffff',
      },
      background: {
        default: '#FFFBFE',
        paper: '#FFFBFE',
      },
      text: {
        primary: '#1C1B1F',
        secondary: '#49454F',
      },
      divider: '#79747E',
    },
    dark: {
      mode: 'dark',
      primary: {
        main: '#D0BCFF',
        light: '#EADDFF',
        dark: '#4F378B',
        contrastText: '#371E73',
      },
      secondary: {
        main: '#CCC2DC',
        light: '#E8DEF8',
        dark: '#4A4458',
        contrastText: '#332D41',
      },
      success: {
        main: '#22C55E',
        light: '#A3D9A5',
        dark: '#005D33',
        contrastText: '#003919',
      },
      error: {
        main: '#FFB4AB',
        light: '#FFDAD6',
        dark: '#93000A',
        contrastText: '#690005',
      },
      warning: {
        main: '#EFB8C8',
        light: '#FFD8E4',
        dark: '#633B48',
        contrastText: '#492532',
      },
      background: {
        default: '#10131B',
        paper: '#10131B',
      },
      text: {
        primary: '#E6E1E5',
        secondary: '#CAC4D0',
      },
      divider: '#938F99',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 400,
      fontSize: '3.5rem',
      lineHeight: 1.12,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 400,
      fontSize: '2.8rem',
      lineHeight: 1.16,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 400,
      fontSize: '2rem',
      lineHeight: 1.2,
      letterSpacing: '0em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '20px',
          fontWeight: 500,
          height: 40,
          paddingLeft: 24,
          paddingRight: 24,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
          },
        },
      },
    },
  },
};
