import { useMemo, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { cacheLtr, cacheRtl } from './i18n/emotionCache';
import { createAppTheme } from './theme/createAppTheme';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function AppShell() {
  const { i18n, t } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const theme = useMemo(() => createAppTheme(isRtl ? 'rtl' : 'ltr'), [isRtl]);

  useEffect(() => {
    document.title = t('app.title');
  }, [i18n.language, t]);

  return (
    <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
    <SpeedInsights />
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
