import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { OptionParams } from '../engine/types'
import { generatePayoffCurve } from '../engine/simulation'
import { useApp } from '../context'
import { t } from '../i18n'
import { HelpTip } from './HelpTip'

interface Props {
  params: OptionParams
  showMaturity: boolean
}

export function PayoffChart({ params, showMaturity }: Props) {
  const { lang, theme } = useApp()

  const option = useMemo(() => {
    const curveParams = showMaturity
      ? { ...params, maturityDate: new Date(Date.now() - 1) }
      : params
    const curve = generatePayoffCurve(curveParams, [
      Math.max(50, params.currentPrice * 0.2),
      params.currentPrice * 2,
    ])

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
        data: [t(lang, 'chart.pName'), t(lang, 'chart.nName')],
        bottom: 0,
        textStyle: { color: textColor, fontSize: 11 },
      },
      grid: { top: 40, right: 40, bottom: 40, left: 50 },
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
        min: 0,
        max: 1,
        nameTextStyle: { color: textColor, fontSize: 11 },
        axisLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: borderColor } },
      },
      series: [
        {
          name: t(lang, 'chart.pName'),
          type: 'line',
          data: curve.map((s) => [s.price, s.pValue]),
          smooth: true,
          lineStyle: { color: '#22c55e', width: 2 },
          itemStyle: { color: '#22c55e' },
          symbol: 'none',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(34, 197, 94, 0.15)' },
                { offset: 1, color: 'rgba(34, 197, 94, 0)' },
              ],
            },
          },
        },
        {
          name: t(lang, 'chart.nName'),
          type: 'line',
          data: curve.map((s) => [s.price, s.nValue]),
          smooth: true,
          lineStyle: { color: '#ef4444', width: 2 },
          itemStyle: { color: '#ef4444' },
          symbol: 'none',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(239, 68, 68, 0.15)' },
                { offset: 1, color: 'rgba(239, 68, 68, 0)' },
              ],
            },
          },
        },
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#7c3aed', type: 'dashed', width: 1 },
            data: [
              {
                xAxis: params.strikePrice,
                label: { formatter: `S=${params.strikePrice}`, color: '#7c3aed', fontSize: 10 },
              },
              {
                xAxis: params.currentPrice,
                label: { formatter: lang === 'zh' ? `现货=${params.currentPrice}` : `Spot=${params.currentPrice}`, color: '#7c3aed', fontSize: 10 },
              },
            ],
          },
          data: [],
        },
      ],
    }
  }, [params, showMaturity, lang, theme])

  return (
    <div className="rounded-lg p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center" style={{ color: 'var(--color-text)' }}>
          {showMaturity ? t(lang, 'payoff.maturity') : t(lang, 'payoff.prematurity')}
          <HelpTip helpKey="help.payoff" />
        </h2>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {t(lang, 'payoff.pnInvariant')}
        </span>
      </div>
      <ReactECharts option={option} style={{ height: 350 }} />
    </div>
  )
}