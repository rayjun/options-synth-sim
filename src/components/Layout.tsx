import type { FC, ReactNode } from 'react'
import { useApp } from '../context'
import { t } from '../i18n'

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const { lang, setLang, theme, toggleTheme } = useApp()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            {t(lang, 'app.title')}
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'app.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <div className="flex rounded overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setLang('en')}
              className="px-2 py-1 text-xs transition-colors"
              style={{
                background: lang === 'en' ? 'var(--color-accent)' : 'transparent',
                color: lang === 'en' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang('zh')}
              className="px-2 py-1 text-xs transition-colors"
              style={{
                background: lang === 'zh' ? 'var(--color-accent)' : 'transparent',
                color: lang === 'zh' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              中文
            </button>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded flex items-center justify-center text-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <a
            href="https://ethresear.ch/t/building-index-tracking-assets-on-top-of-options-instead-of-debt/25036"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors hover:underline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t(lang, 'app.attribution')}
          </a>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}