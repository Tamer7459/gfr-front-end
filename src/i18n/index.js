import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import ar from '../locales/ar.json';
import fr from '../locales/fr.json';

export const STORAGE_KEY = 'gfr-lang';
export const SUPPORTED_LANGS = ['en', 'ar', 'fr'];

function applyDocumentLang(lng) {
  const code = lng?.split('-')[0] || 'en';
  document.documentElement.lang = code === 'ar' ? 'ar' : code === 'fr' ? 'fr' : 'en';
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
}

const saved = localStorage.getItem(STORAGE_KEY);
const initial = saved && SUPPORTED_LANGS.includes(saved) ? saved : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr },
  },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

applyDocumentLang(i18n.language);

i18n.on('languageChanged', (lng) => {
  const code = lng?.split('-')[0] || 'en';
  if (SUPPORTED_LANGS.includes(code)) {
    localStorage.setItem(STORAGE_KEY, code);
  }
  applyDocumentLang(lng);
});

export default i18n;
