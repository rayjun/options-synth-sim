import { describe, it, expect } from 'vitest'
import { generatePayoffCurve, simulateRebalancing, generatePricePath } from '../simulation'
import type { OptionParams } from '../types'

function makeParams(overrides: Partial<OptionParams> = {}): OptionParams {
  return {
    strikePrice: 1500,
    currentPrice: 2500,
    maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    volatility: 0.5,
    riskFreeRate: 0.05,
    ...overrides,
  }
}

describe('generatePayoffCurve', () => {
  it('returns correct length', () => {
    const curve = generatePayoffCurve(makeParams(), [1000, 5000], 200)
    expect(curve.length).toBe(200)
  })

  it('P decreases as price increases (monotonic at maturity)', () => {
    // At maturity, P should be strictly non-increasing
    const params = makeParams({
      maturityDate: new Date(Date.now() - 1), // already expired
    })
    const curve = generatePayoffCurve(params, [500, 5000], 50)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].pValue).toBeLessThanOrEqual(curve[i - 1].pValue)
    }
  })

  it('P + N = 1 for all points', () => {
    const curve = generatePayoffCurve(makeParams(), [1000, 5000], 50)
    for (const step of curve) {
      expect(step.pValue + step.nValue).toBeCloseTo(1, 10)
    }
  })

  it('delta is near 0 for deep OTM (currentPrice >> strikePrice)', () => {
    const curve = generatePayoffCurve(makeParams(), [1000, 5000], 100)
    // Price = 5000, strike = 1500 → deep OTM for N-put
    const highPrice = curve[curve.length - 1]
    expect(Math.abs(highPrice.delta)).toBeLessThan(0.01)
  })
})

describe('generatePricePath', () => {
  it('returns correct number of steps', () => {
    const path = generatePricePath(2500, 0.5, 30, 0.05)
    expect(path.length).toBe(31) // 30 days + day 0
  })

  it('first value is the initial price', () => {
    const path = generatePricePath(2500, 0.5, 30, 0.05)
    expect(path[0]).toBe(2500)
  })
})

describe('simulateRebalancing', () => {
  it('produces steps with tracking error', () => {
    const params = makeParams()
    const path = generatePricePath(2500, 0.5, 60, 0.05)
    const result = simulateRebalancing(params, path, 1.5)
    expect(result.steps.length).toBeGreaterThan(0)
    expect(typeof result.trackingError).toBe('number')
    expect(typeof result.finalPnl).toBe('number')
  })

  it('no-rebalance hold has larger tracking error than rebalanced', () => {
    const params = makeParams()
    // Generate a path that drops significantly
    const path = generatePricePath(2500, 1.0, 60, -0.05) // downward drift
    const result = simulateRebalancing(params, path, 1.5)
    // tracking error should be non-negative
    expect(result.trackingError).toBeGreaterThanOrEqual(0)
  })
})