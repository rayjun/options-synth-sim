import type { OptionParams, OptionPayoff } from './types'

// Cumulative normal distribution function
// Abramowitz and Stegun approximation (error < 7.5e-8)
function normalCDF(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return 0.5 * (1.0 + sign * y)
}

// Black-Scholes European call option price
export function blackScholesCall(S: number, K: number, T: number, sigma: number, r: number): number {
  if (T <= 1e-10) return Math.max(0, S - K)
  if (sigma <= 1e-10) return Math.max(0, S - K * Math.exp(-r * T))
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)
  return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2)
}

// At maturity: P = min(1, S/x), N = max(0, 1 - S/x)
// Always P + N = 1
export function payoffAtMaturity(currentPrice: number, strikePrice: number): OptionPayoff {
  if (currentPrice <= 0) return { pValue: 1, nValue: 0 }
  const ratio = strikePrice / currentPrice
  const pValue = Math.min(1, ratio)
  const nValue = Math.max(0, 1 - ratio)
  return { pValue, nValue }
}

// Pre-maturity pricing:
// N is a put option on T (index, e.g. USD/ETH) with strike S.
// Price put in USD via Black-Scholes + put-call parity,
// then convert to ETH terms: N_eth = put_usd / currentPrice.
// P_eth = 1 - N_eth
export function priceOption(params: OptionParams): OptionPayoff {
  const { strikePrice, currentPrice, maturityDate, volatility, riskFreeRate } = params
  const now = new Date()
  const T = Math.max(0, (maturityDate.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

  const callPrice = blackScholesCall(currentPrice, strikePrice, T, volatility, riskFreeRate)
  const putPrice = callPrice - currentPrice + strikePrice * Math.exp(-riskFreeRate * T)

  const nValue = Math.max(0, Math.min(1, putPrice / currentPrice))
  const pValue = 1 - nValue

  return { pValue, nValue }
}

// Finite-difference greeks: delta = dP/dx, gamma = d²P/dx², theta = dP/dT
export function computeGreeks(params: OptionParams): {
  delta: number
  gamma: number
  theta: number
} {
  const h = params.currentPrice * 0.001 // 0.1% bump

  const up = priceOption({ ...params, currentPrice: params.currentPrice + h })
  const down = priceOption({ ...params, currentPrice: params.currentPrice - h })
  const mid = priceOption(params)

  const delta = (up.pValue - down.pValue) / (2 * h)
  const gamma = (up.pValue - 2 * mid.pValue + down.pValue) / (h * h)

  // Theta: bump time forward by 1 day
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const future = priceOption({ ...params, maturityDate: params.maturityDate })
  const earlier = priceOption({ ...params, maturityDate: tomorrow })
  const theta = earlier.pValue - future.pValue

  return { delta, gamma, theta }
}