import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { OptionParams } from '../engine/types'
import { generatePayoffCurve } from '../engine/simulation'
import { useApp } from '../context'
import { t } from '../i18n'
import { HelpTip } from './HelpTip'

interface Props {
  params: OptionParams
}

export function GreeksChart({ params }: Props) {
  const { lang, theme } = useApp()

  const option = useMemo(() => {
    const curve = generatePayoffCurve(params, [
      Math.max(50, params.currentPrice * 0.3),
      params.currentPrice * 2,
    ], 150)

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
        data: [t(lang, 'greeks.delta'), t(lang, 'greeks.gamma'), t(lang, 'greeks.theta')],
        bottom: 0,
        textStyle: { color: textColor, fontSize: 11 },
      },
      grid: { top: 20, right: 50, bottom: 40, left: 60 },
      xAxis: {
        type: 'value',
        name: t(lang, 'chart.priceAxis'),
        nameTextStyle: { color: textColor, fontSize: 11 },
        axisLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: borderColor } },
      },
      yAxis: {
        type: 'value',
        name: t(lang, 'chart.valueAxis'),
        nameTextStyle: { color: textColor, fontSize: 11 },
        axisLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: borderColor } },
      },
      series: [
        {
          name: t(lang, 'greeks.delta'),
          type: 'line',
          data: curve.map((s) => [s.price, s.delta * 1000]),
          smooth: true,
          lineStyle: { color: '#7c3aed', width: 2 },
          symbol: 'none',
        },
        {
          name: t(lang, 'greeks.gamma'),
          type: 'line',
          data: curve.map((s) => [s.price, s.gamma * 100000]),
          smooth: true,
          lineStyle: { color: '#f59e0b', width: 2 },
          symbol: 'none',
        },
        {
          name: t(lang, 'greeks.theta'),
          type: 'line',
          data: curve.map((s) => [s.price, s.theta * 10]),
          smooth: true,
          lineStyle: { color: '#06b6d4', width: 2 },
          symbol: 'none',
        },
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#7c3aed', type: 'dashed', width: 1 },
            data: [{
              xAxis: params.strikePrice,
              label: { formatter: `S=${params.strikePrice}`, color: '#7c3aed', fontSize: 10 },
            }],
          },
          data: [],
        },
      ],
    }
  }, [params, lang, theme])

  return (
    <div className="rounded-lg p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center" style={{ color: 'var(--color-text)' }}>
        {t(lang, 'greeks.heading')}
        <HelpTip helpKey="help.greeks" />
      </h2>
      <ReactECharts option={option} style={{ height: 300 }} />
    </div>
  )
}