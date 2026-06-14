import { describe, it, expect } from 'vitest'
import {
  blackScholesCall,
  payoffAtMaturity,
  priceOption,
  computeGreeks,
} from '../pricing'

describe('payoffAtMaturity', () => {
  it('Strike=1500, current=2500 → P=0.6, N=0.4', () => {
    const { pValue, nValue } = payoffAtMaturity(2500, 1500)
    expect(pValue).toBeCloseTo(0.6, 10)
    expect(nValue).toBeCloseTo(0.4, 10)
  })

  it('Strike=1500, current=1000 → P=1, N=0 (capped)', () => {
    const { pValue, nValue } = payoffAtMaturity(1000, 1500)
    expect(pValue).toBe(1)
    expect(nValue).toBe(0)
  })

  it('Strike=2500, current=2500 → P=1, N=0', () => {
    const { pValue, nValue } = payoffAtMaturity(2500, 2500)
    expect(pValue).toBe(1)
    expect(nValue).toBe(0)
  })

  it('Strike=2500, current=5000 → P=0.5, N=0.5', () => {
    const { pValue, nValue } = payoffAtMaturity(5000, 2500)
    expect(pValue).toBeCloseTo(0.5, 10)
    expect(nValue).toBeCloseTo(0.5, 10)
  })

  it('currentPrice=0 → returns {pValue: 1, nValue: 0}', () => {
    const { pValue, nValue } = payoffAtMaturity(0, 1500)
    expect(pValue).toBe(1)
    expect(nValue).toBe(0)
  })
})

describe('P + N always equals 1', () => {
  it('for various random params', () => {
    for (const [current, strike] of [[2500, 1500], [3000, 2000], [1800, 2500], [5000, 500], [100, 5000]]) {
      const { pValue, nValue } = payoffAtMaturity(current, strike)
      expect(pValue + nValue).toBeCloseTo(1, 10)
    }
  })
})

describe('blackScholesCall', () => {
  it('ATM: S=2500, K=2500, T=30/365, σ=0.5, r=0.05 → call > 0', () => {
    const call = blackScholesCall(2500, 2500, 30 / 365, 0.5, 0.05)
    expect(call).toBeGreaterThan(0)
    expect(call).toBeLessThan(2500) // can't exceed spot
  })

  it('Deep ITM: S=10000, K=2500, call ≈ S - K*e^(-rT)', () => {
    const T = 30 / 365
    const call = blackScholesCall(10000, 2500, T, 0.5, 0.05)
    const intrinsic = 10000 - 2500 * Math.exp(-0.05 * T)
    // should be close to intrinsic for deep ITM
    expect(call).toBeGreaterThan(intrinsic * 0.9)
  })

  it('Deep OTM: S=100, K=2500 → call ≈ 0', () => {
    const call = blackScholesCall(100, 2500, 30 / 365, 0.5, 0.05)
    expect(call).toBeLessThan(1)
  })

  it('σ=0 → returns intrinsic value (no division by zero)', () => {
    const call = blackScholesCall(2500, 2000, 30 / 365, 0, 0.05)
    expect(call).toBeCloseTo(2500 - 2000 * Math.exp(-0.05 * 30 / 365), 10)
  })

  it('T=0 → returns max(0, S-K)', () => {
    expect(blackScholesCall(2500, 2000, 0, 0.5, 0)).toBe(500)
    expect(blackScholesCall(1500, 2000, 0, 0.5, 0)).toBe(0)
  })

  it('Very small σ (1e-12) → does not crash', () => {
    const call = blackScholesCall(2500, 2000, 30 / 365, 1e-12, 0.05)
    expect(isFinite(call)).toBe(true)
    expect(call).toBeGreaterThan(0)
  })
})

describe('priceOption', () => {
  it('returns P + N = 1 for pre-maturity pricing', () => {
    const params = {
      strikePrice: 1500,
      currentPrice: 2500,
      maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      volatility: 0.5,
      riskFreeRate: 0.05,
    }
    const { pValue, nValue } = priceOption(params)
    expect(pValue + nValue).toBeCloseTo(1, 10)
  })

  it('deep ITM option: P close to 1, N close to 0', () => {
    // Deep ITM for P means the option matures at a strike far above
    // current price, i.e. P holder is well hedged.
    // But pre-maturity, the put is deep OTM in USD terms,
    // so N is near 0 and P near 1.
    // This happens when currentPrice >> strikePrice (P is far "out of the money"
    // in the sense that the N-put is far OTM).
    const params = {
      strikePrice: 1500,
      currentPrice: 5000,  // far above strike → N-put is deep OTM
      maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      volatility: 0.3,
      riskFreeRate: 0.05,
    }
    const { pValue, nValue } = priceOption(params)
    expect(pValue).toBeGreaterThan(0.9)
    expect(nValue).toBeLessThan(0.1)
  })
})

describe('computeGreeks', () => {
  it('returns finite numbers', () => {
    const params = {
      strikePrice: 1500,
      currentPrice: 2500,
      maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      volatility: 0.5,
      riskFreeRate: 0.05,
    }
    const { delta, gamma, theta } = computeGreeks(params)
    expect(isFinite(delta)).toBe(true)
    expect(isFinite(gamma)).toBe(true)
    expect(isFinite(theta)).toBe(true)
  })

  it('delta magnitude increases near the strike', () => {
    // Near the strike, delta should have meaningful magnitude
    const nearStrikeParams = {
      strikePrice: 2500,
      currentPrice: 2500,
      maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      volatility: 0.5,
      riskFreeRate: 0.05,
    }
    const farOTMParams = {
      strikePrice: 1500,
      currentPrice: 2500,
      maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      volatility: 0.5,
      riskFreeRate: 0.05,
    }
    const nearGreeks = computeGreeks(nearStrikeParams)
    const farGreeks = computeGreeks(farOTMParams)
    // Abs delta near strike should be greater than abs delta far OTM
    expect(Math.abs(nearGreeks.delta)).toBeGreaterThan(Math.abs(farGreeks.delta))
  })
})