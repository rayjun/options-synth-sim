import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { OptionParams } from '../engine/types'
import { generatePricePath, simulateRebalancing } from '../engine/simulation'
import { useApp } from '../context'
import { t } from '../i18n'
import { HelpTip } from './HelpTip'

interface Props {
  params: OptionParams
}

export function RebalanceSimulator({ params }: Props) {
  const { lang, theme } = useApp()
  const [seed, setSeed] = useState(42)
  const [threshold, setThreshold] = useState(1.5)

  const { pricePath, result, rebalancedCurve } = useMemo(() => {
    const oldRandom = Math.random
    let s = seed
    Math.random = () => {
      s = (s * 16807) % 2147483647
      return (s - 1) / 2147483646
    }

    try {
      const path = generatePricePath(params.currentPrice, params.volatility, 60, 0.02)
      const res = simulateRebalancing(params, path, threshold)

      const holdResult = simulateRebalancing(
        { ...params, strikePrice: params.strikePrice * 100 },
        path,
        0,
      )

      return {
        pricePath: path,
        result: res,
        rebalancedCurve: holdResult,
      }
    } finally {
      Math.random = oldRandom
    }
  }, [params, seed, threshold])

  const chartOption = useMemo(() => {
    const textColor = theme === 'dark' ? '#71717a' : '#a1a1aa'
    const borderColor = theme === 'dark' ? '#1f1f22' : '#e4e4e7'

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme === 'dark' ? '#131315' : '#fff',
        borderColor,
        textStyle: { color: theme === 'dark' ? '#e4e4e7' : '#18181b', fontSize: 12 },
      },
      legend: {
        data: [t(lang, 'chart.ethPriceScaled'), t(lang, 'chart.pRebalanced')],
        bottom: 0,
        textStyle: { color: textColor, fontSize: 11 },
      },
      grid: { top: 20, right: 40, bottom: 40, left: 50 },
      xAxis: {
        type: 'value',
        name: t(lang, 'chart.dayAxis'),
        nameTextStyle: { color: textColor, fontSize: 11 },
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: borderColor } },
      },
      yAxis: {
        type: 'value',
        name: t(lang, 'chart.valueAxis'),
        nameTextStyle: { color: textColor, fontSize: 11 },
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: borderColor } },
      },
      series: [
        {
          name: t(lang, 'chart.ethPriceScaled'),
          type: 'line',
          data: pricePath.map((p, i) => [i, p / pricePath[0]]),
          lineStyle: { color: textColor, width: 1, type: 'dashed' },
          symbol: 'none',
        },
        {
          name: t(lang, 'chart.pRebalanced'),
          type: 'line',
          data: rebalancedCurve.steps.map((s) => [s.day, s.pValue]),
          smooth: true,
          lineStyle: { color: '#22c55e', width: 2 },
          symbol: 'none',
          areaStyle: { color: 'rgba(34, 197, 94, 0.12)' },
        },
        {
          name: t(lang, 'chart.rebalanceEvents'),
          type: 'scatter',
          data: result.steps
            .filter((s) => s.action !== 'hold')
            .map((s) => [s.day, s.pValue]),
          symbolSize: 12,
          itemStyle: { color: '#f59e0b' },
        },
      ],
    }
  }, [pricePath, rebalancedCurve, result, lang, theme])

  const rebalanceCount = result.steps.filter((s) => s.action !== 'hold').length

  return (
    <div className="rounded-lg p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center" style={{ color: 'var(--color-text)' }}>
          {t(lang, 'rebalance.heading')}
          <HelpTip helpKey="help.rebalance" />
        </h2>
        <div className="flex gap-3">
          <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'rebalance.threshold')}:{' '}
            <input
              type="number"
              min={1.1}
              max={3.0}
              step={0.1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-14 rounded px-1 text-xs"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </label>
          <button
            onClick={() => setSeed(Math.floor(Math.random() * 100000))}
            className="text-xs px-3 py-1 rounded transition-colors text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            {t(lang, 'rebalance.newPath')}
          </button>
        </div>
      </div>

      <ReactECharts option={chartOption} style={{ height: 300 }} />

      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="rounded p-2 text-center" style={{ background: 'var(--color-bg)' }}>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'rebalance.rebalances')}
          </div>
          <div className="text-sm font-mono" style={{ color: 'var(--color-text)' }}>
            {rebalanceCount}
          </div>
        </div>
        <div className="rounded p-2 text-center" style={{ background: 'var(--color-bg)' }}>
          <div className="text-xs flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'rebalance.trackingError')}
            <HelpTip helpKey="help.trackingError" />
          </div>
          <div className="text-sm font-mono" style={{ color: 'var(--color-yellow)' }}>
            {(result.trackingError * 100).toFixed(2)}%
          </div>
        </div>
        <div className="rounded p-2 text-center" style={{ background: 'var(--color-bg)' }}>
          <div className="text-xs flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            {t(lang, 'rebalance.finalPnl')}
            <HelpTip helpKey="help.finalPnl" />
          </div>
          <div className="text-sm font-mono" style={{ color: 'var(--color-green)' }}>
            {(result.finalPnl * 100).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}