import { createTheme } from '@mui/material';

const palette = {
  mode: 'light',
  primary: {
    main: '#0c6e67',
    light: '#3d9d94',
    dark: '#064a45',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#c45c26',
    light: '#e88a54',
    dark: '#8a3d15',
    contrastText: '#ffffff',
  },
  background: {
    default: '#eef2f0',
    paper: '#ffffff',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
  },
  divider: 'rgba(15, 23, 42, 0.08)',
};

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: '#cbd5e1 transparent',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        textTransform: 'none',
        fontWeight: 700,
        paddingInline: '1.1rem',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(15, 23, 42, 0.07)',
        border: '1px solid',
        borderColor: 'rgba(15, 23, 42, 0.06)',
      },
    },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backdropFilter: 'saturate(160%) blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        borderBottom: '1px solid',
        borderColor: 'rgba(15, 23, 42, 0.06)',
      },
    },
  },
  MuiTextField: {
    defaultProps: { variant: 'outlined' },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: { borderRadius: 12 },
    },
  },
};

export function createAppTheme(direction) {
  const isRtl = direction === 'rtl';
  return createTheme({
    direction,
    palette,
    typography: {
      fontFamily: isRtl
        ? ['Cairo', 'Tahoma', 'sans-serif'].join(',')
        : ['DM Sans', 'Segoe UI', 'system-ui', 'sans-serif'].join(','),
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { fontWeight: 700 },
    },
    shape: { borderRadius: 12 },
    components,
  });
}
