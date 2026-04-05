// src/App.js
import { useMemo, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { cacheLtr, cacheRtl } from './i18n/emotionCache';
import { createAppTheme } from './theme/createAppTheme';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  const { i18n, t } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // إنشاء Theme حسب اللغة
  const theme = useMemo(() => createAppTheme(isRtl ? 'rtl' : 'ltr'), [isRtl]);

  // تغيير عنوان الصفحة تلقائيًا عند تغيير اللغة
  useEffect(() => {
    document.title = t('app.title');
  }, [i18n.language, t]);

  return (
    <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <ThemeContextProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ThemeContextProvider>
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
