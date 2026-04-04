import { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';

const ThemeContext = createContext(null);

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(
    localStorage.getItem('gfr_theme') || 'light'
  );

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('gfr_theme', newMode);
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? {
        primary:    { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
        secondary:  { main: '#9c27b0' },
        background: { default: '#f5f5f5', paper: '#ffffff' },
        text:       { primary: '#1a1a1a', secondary: '#666666' },
      } : {
        primary:    { main: '#42a5f5', light: '#80d6ff', dark: '#0077c2' },
        secondary:  { main: '#ce93d8' },
        background: { default: '#0a0a0a', paper: '#1a1a1a' },
        text:       { primary: '#ffffff', secondary: '#aaaaaa' },
      }),
    },
    typography: {
      fontFamily: ['Cairo', 'Roboto', 'sans-serif'].join(','),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius:  8,
            textTransform: 'none',
            fontWeight:    600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'dark'
              ? '0 2px 12px rgba(0,0,0,0.4)'
              : '0 2px 12px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
            color:           mode === 'dark' ? '#ffffff' : '#1a1a1a',
          },
        },
      },
    },
  }), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// في ThemeContext.jsx
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeContextProvider');
  return context;
};