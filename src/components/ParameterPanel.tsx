import type { OptionParams } from '../engine/types'
import { priceOption } from '../engine/pricing'
import { useApp } from '../context'
import { t } from '../i18n'
import { HelpTip } from './HelpTip'

interface Props {
  params: OptionParams
  onChange: (params: OptionParams) => void
}

export function ParameterPanel({ params, onChange }: Props) {
  const { lang } = useApp()
  const payoff = priceOption(params)

  return (
    <div className="rounded-lg p-5 space-y-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
        {t(lang, 'params.heading')}
      </h2>

      <div className="space-y-3">
        {/* Strike Price */}
        <label className="block">
          <span className="text-xs flex items-center" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'params.strike')} ({params.strikePrice})
            <HelpTip helpKey="help.strike" />
          </span>
          <input
            type="range"
            min={100}
            max={10000}
            step={50}
            value={params.strikePrice}
            onChange={(e) => onChange({ ...params, strikePrice: Number(e.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--color-accent)' }}
          />
        </label>

        {/* Current Price */}
        <label className="block">
          <span className="text-xs flex items-center" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'params.currentPrice')} ({params.currentPrice})
            <HelpTip helpKey="help.currentPrice" />
          </span>
          <input
            type="range"
            min={100}
            max={10000}
            step={50}
            value={params.currentPrice}
            onChange={(e) => onChange({ ...params, currentPrice: Number(e.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--color-accent)' }}
          />
        </label>

        {/* Volatility */}
        <label className="block">
          <span className="text-xs flex items-center" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'params.volatility')} ({(params.volatility * 100).toFixed(0)}%)
            <HelpTip helpKey="help.volatility" />
          </span>
          <input
            type="range"
            min={0.1}
            max={2.0}
            step={0.05}
            value={params.volatility}
            onChange={(e) => onChange({ ...params, volatility: Number(e.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--color-accent)' }}
          />
        </label>

        {/* Risk-Free Rate */}
        <label className="block">
          <span className="text-xs flex items-center" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'params.riskFreeRate')} ({(params.riskFreeRate * 100).toFixed(1)}%)
            <HelpTip helpKey="help.riskFreeRate" />
          </span>
          <input
            type="range"
            min={0}
            max={0.2}
            step={0.005}
            value={params.riskFreeRate}
            onChange={(e) => onChange({ ...params, riskFreeRate: Number(e.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--color-accent)' }}
          />
        </label>

        {/* Maturity */}
        <label className="block">
          <span className="text-xs flex items-center" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'params.maturity')}
            <HelpTip helpKey="help.maturity" />
          </span>
          <input
            type="date"
            value={params.maturityDate.toISOString().split('T')[0]}
            onChange={(e) => onChange({ ...params, maturityDate: new Date(e.target.value) })}
            className="w-full rounded px-2 py-1 text-sm mt-1"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </label>
      </div>

      {/* Current P/N Values */}
      <div className="grid grid-cols-2 gap-3 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="rounded p-3 text-center" style={{ background: 'var(--color-bg)' }}>
          <div className="text-xs mb-1 flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'params.pLabel')}
            <HelpTip helpKey="help.pValue" />
          </div>
          <div className="text-lg font-mono" style={{ color: 'var(--color-green)' }}>
            {payoff.pValue.toFixed(4)} ETH
          </div>
        </div>
        <div className="rounded p-3 text-center" style={{ background: 'var(--color-bg)' }}>
          <div className="text-xs mb-1 flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'params.nLabel')}
            <HelpTip helpKey="help.nValue" />
          </div>
          <div className="text-lg font-mono" style={{ color: 'var(--color-red)' }}>
            {payoff.nValue.toFixed(4)} ETH
          </div>
        </div>
      </div>
    </div>
  )
}