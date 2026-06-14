import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Lang } from './i18n'

type Theme = 'dark' | 'light'

interface AppContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const AppContext = createContext<AppContextValue>(null!)

const STORAGE_KEY_LANG = 'options-synth-lang'
const STORAGE_KEY_THEME = 'options-synth-theme'

function detectSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'dark'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_LANG)
      if (saved === 'zh') return 'zh'
    }
    return 'en'
  })

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_THEME)
      if (saved === 'dark' || saved === 'light') return saved
    }
    return detectSystemTheme()
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY_LANG, l)
  }

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY_THEME, t)
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
  }, [theme])

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}