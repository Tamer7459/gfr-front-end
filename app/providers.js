'use client'
import { useEffect, useRef } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'
import { useTranslation } from 'react-i18next'

import { createAppTheme } from '@/theme/createAppTheme'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeContextProvider } from '@/context/ThemeContext'
import { STORAGE_KEY, SUPPORTED_LANGS, applyDocumentLang } from '@/i18n'
import '@/i18n'

function EmotionCache({ rtl, children }) {
  const cacheRef = useRef(null)

  if (!cacheRef.current || cacheRef.current.rtl !== rtl) {
    const cache = createCache({
      key: rtl ? 'mui-rtl' : 'mui',
      prepend: true,
      ...(rtl ? { stylisPlugins: [prefixer, rtlPlugin] } : {}),
    })
    cache.compat = true
    let inserted = []
    const prevInsert = cache.insert
    cache.insert = (...args) => {
      const serialized = args[1]
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }
    cache.flush = () => {
      const prev = inserted
      inserted = []
      return prev
    }
    cacheRef.current = { cache, rtl }
  }

  const { cache } = cacheRef.current

  useServerInsertedHTML(() => {
    const { cache } = cacheRef.current
    const names = cache.flush()
    if (names.length === 0) return null
    let styles = ''
    for (const name of names) {
      styles += cache.inserted[name]
    }
    return (
      <style
        key={names.join('-')}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}

function AppInner({ children }) {
  const { i18n, t } = useTranslation()
  const isRtl = i18n.language === 'ar'

  useEffect(() => {
    applyDocumentLang(i18n.language)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && SUPPORTED_LANGS.includes(saved) && saved !== i18n.language) {
        i18n.changeLanguage(saved)
      }
    }
  }, [i18n])

  useEffect(() => {
    document.title = t('app.title')
  }, [i18n.language, t])

  const theme = isRtl ? createAppTheme('rtl') : createAppTheme('ltr')

  return (
    <EmotionCache rtl={isRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ThemeContextProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeContextProvider>
      </ThemeProvider>
    </EmotionCache>
  )
}

export default function Providers({ children }) {
  return <AppInner>{children}</AppInner>
}
