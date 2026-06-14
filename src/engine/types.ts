export interface OptionParams {
  strikePrice: number   // S — denominated in the index T
  maturityDate: Date    // M
  currentPrice: number  // current value of T (e.g., ETH/USD)
  volatility: number    // σ (annualized, e.g., 0.5 = 50%)
  riskFreeRate: number  // r (annualized, e.g., 0.05 = 5%)
}

export interface OptionPayoff {
  pValue: number  // P receives this fraction of 1 ETH
  nValue: number  // N receives this fraction of 1 ETH
}

export interface SimulationStep {
  price: number
  pValue: number
  nValue: number
  delta: number   // derivative of P w.r.t. price
  gamma: number   // second derivative
  theta: number   // time decay per day
}