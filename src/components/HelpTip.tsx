import { useState, type FC } from 'react'
import { useApp } from '../context'
import { t } from '../i18n'

interface Props {
  helpKey: string
}

export const HelpTip: FC<Props> = ({ helpKey }) => {
  const [open, setOpen] = useState(false)
  const { lang } = useApp()
  const helpText = t(lang, helpKey)

  return (
    <span className="relative inline-flex items-center">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open) }}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold transition-colors ml-1 flex-shrink-0"
        style={{
          background: open ? 'var(--color-accent)' : 'var(--color-border)',
          color: open ? '#fff' : 'var(--color-text-muted)',
          lineHeight: 1,
        }}
      >
        ?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute z-50 w-64 p-3 rounded-lg shadow-lg text-xs leading-relaxed"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-accent)',
              color: 'var(--color-text)',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            {helpText}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                top: '100%',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid var(--color-accent)',
              }}
            />
          </div>
        </>
      )}
    </span>
  )
}