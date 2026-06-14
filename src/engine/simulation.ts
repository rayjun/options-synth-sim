import type { OptionParams, SimulationStep } from './types'
import { payoffAtMaturity, priceOption, computeGreeks } from './pricing'

// Generate payoff curve across a range of prices
// Returns pre-maturity valuations if maturity is in the future,
// otherwise maturity payoffs.
export function generatePayoffCurve(
  params: OptionParams,
  priceRange: [number, number],
  points: number = 200,
): SimulationStep[] {
  const [minPrice, maxPrice] = priceRange
  const steps: SimulationStep[] = []
  const now = Date.now()
  const isExpired = params.maturityDate.getTime() <= now

  for (let i = 0; i < points; i++) {
    const price = minPrice + (maxPrice - minPrice) * (i / (points - 1))

    let pValue: number
    let nValue: number

    if (isExpired) {
      const payoff = payoffAtMaturity(price, params.strikePrice)
      pValue = payoff.pValue
      nValue = payoff.nValue
    } else {
      const priced = priceOption({ ...params, currentPrice: price })
      pValue = priced.pValue
      nValue = priced.nValue
    }

    // Compute greeks at this price point
    const greeks = computeGreeks({ ...params, currentPrice: price })

    steps.push({
      price,
      pValue,
      nValue,
      delta: greeks.delta,
      gamma: greeks.gamma,
      theta: greeks.theta,
    })
  }

  return steps
}

// Generate a geometric Brownian motion price path
export function generatePricePath(
  initialPrice: number,
  volatility: number,
  days: number,
  drift: number = 0,
): number[] {
  const path: number[] = [initialPrice]
  const dt = 1 / 365.25
  let price = initialPrice

  for (let i = 0; i < days; i++) {
    // Box-Muller transform for normal random
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    price *= Math.exp((drift - volatility * volatility / 2) * dt + volatility * Math.sqrt(dt) * z)
    path.push(Math.max(0.01, price))
  }

  return path
}

// Simulate rebalancing: walk through price path, rotate to new
// lower-strike options when price drops below threshold
export function simulateRebalancing(
  params: OptionParams,
  pricePath: number[],
  rebalanceThreshold: number,
): { steps: { day: number; price: number; pValue: number; action: string }[]; trackingError: number; finalPnl: number } {
  const steps: { day: number; price: number; pValue: number; action: string }[] = []
  let currentStrike = params.strikePrice
  let currentMaturity = params.maturityDate
  let totalSlippage = 0

  for (let day = 0; day < pricePath.length; day++) {
    const price = pricePath[day]

    // Check if rebalance needed: price < strike * threshold
    if (price > 0 && price < currentStrike * rebalanceThreshold) {
      // Rebalance: rotate to new option pair
      // Slippage: lose some value on the rotation
      currentStrike = price / 2 // new strike at half current price
      currentMaturity = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // new 30-day maturity
      const slippage = 0.002 // assume 0.2% slippage per rebalance
      totalSlippage += slippage

      steps.push({
        day,
        price,
        pValue: 1 - slippage,
        action: `rebalanced: new strike=${Math.round(currentStrike)}`,
      })
    } else {
      // Normal: compute current value
      const priced = priceOption({
        ...params,
        strikePrice: currentStrike,
        maturityDate: currentMaturity,
        currentPrice: price,
      })
      steps.push({
        day,
        price,
        pValue: priced.pValue,
        action: 'hold',
      })
    }
  }

  // Final payoff at last price
  const finalPayoff = payoffAtMaturity(pricePath[pricePath.length - 1], currentStrike)

  // Tracking error: deviation from ideal hedge
  // Ideal: P always = 1 (perfectly stable). Our error is 1 - finalPValue.
  const trackingError = Math.max(0, 1 - finalPayoff.pValue - totalSlippage)

  // PnL: difference from holding 1 ETH
  const finalPrice = pricePath[pricePath.length - 1]
  const initialPrice = pricePath[0]
  const ethReturn = finalPrice / initialPrice - 1
  const finalPnl = finalPayoff.pValue - (1 + ethReturn)

  return { steps, trackingError, finalPnl }
}