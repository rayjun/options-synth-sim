import { useState, useMemo } from 'react'
import { AppProvider } from './context'
import { Layout } from './components/Layout'
import { ParameterPanel } from './components/ParameterPanel'
import { PayoffChart } from './components/PayoffChart'
import { GreeksChart } from './components/GreeksChart'
import { RebalanceSimulator } from './components/RebalanceSimulator'
import { useEthPrice } from './hooks/useEthPrice'
import { useApp } from './context'
import { t } from './i18n'
import type { OptionParams } from './engine/types'

function AppContent() {
  const ethPrice = useEthPrice()
  const { lang } = useApp()

  const [params, setParams] = useState<OptionParams>(() => ({
    strikePrice: 1500,
    currentPrice: 2500,
    maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    volatility: 0.5,
    riskFreeRate: 0.05,
  }))

  const effectiveParams = useMemo(() => {
    if (ethPrice.price && !ethPrice.stale) {
      return { ...params, currentPrice: ethPrice.price }
    }
    return params
  }, [params, ethPrice.price, ethPrice.stale])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">

        {/* ETH Price Banner */}
        {ethPrice.price && (
          <div className="rounded-lg px-4 py-2 flex items-center gap-2 text-sm"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>
              {t(lang, 'price.ethUsd')}:
            </span>
            <span className="font-mono font-semibold" style={{ color: 'var(--color-text)' }}>
              ${ethPrice.price.toLocaleString()}
            </span>
            {ethPrice.stale && (
              <span className="text-xs" style={{ color: 'var(--color-yellow)' }}>
                ({t(lang, 'price.stale')})
              </span>
            )}
            <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>
              {t(lang, 'price.using')}
            </span>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <ParameterPanel params={params} onChange={setParams} />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PayoffChart params={effectiveParams} showMaturity={false} />
              <PayoffChart params={effectiveParams} showMaturity={true} />
            </div>
            <GreeksChart params={effectiveParams} />
            <RebalanceSimulator params={effectiveParams} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs py-4" style={{
          borderTop: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}>
          {t(lang, 'app.footer')}
        </footer>
      </div>
    </Layout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}