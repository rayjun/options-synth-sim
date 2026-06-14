# Options Synth Sim

> Option-Based Synthetic Asset Simulator — built on Vitalik Buterin's ethresear.ch design

A pure frontend simulator + visualization for the option-based synthetic asset construction proposed in ["Building index-tracking assets on top of options instead of debt"](https://ethresear.ch/t/building-index-tracking-assets-on-top-of-options-instead-of-debt/25036).

## The Math

```
P + N = 1 ETH  (always, by construction)

At maturity M, oracle resolves T = x:
  P receives min(1, S/x) ETH  — stable side
  N receives max(0, 1 - S/x) ETH  — speculative side
```

**Key insight:** Instead of using debt (which requires real-time oracles for liquidations), this construction uses options as the base primitive. The P+N pair always sums to 1 ETH — no liquidation possible. The cost is some quadratic tracking drift instead of sudden liquidation risk.

## Features

- **Payoff curves** — Interactive P and N value curves across a range of ETH/USD prices
- **Pre-maturity pricing** — Black-Scholes valuation showing how time and volatility affect option prices
- **Greeks visualization** — Delta, Gamma, Theta charts
- **Rebalancing simulator** — Stochastic price path simulation with configurable rebalancing threshold
- **Live ETH/USD price feed** — From Binance/CoinGecko public APIs
- **Dark-themed dashboard** — Clean, data-dense DeFi aesthetic

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Charts | ECharts 5 |
| Testing | Vitest (24 tests) |
| Pricing | Custom Black-Scholes engine (no external deps) |

## Quick Start

```bash
# Install
npm install

# Development
npm run dev

# Test
npm test

# Build
npm run build
```

## Project Structure

```
src/
├── engine/              # Pure TypeScript — no React
│   ├── types.ts         # OptionParams, OptionPayoff, SimulationStep
│   ├── pricing.ts       # Black-Scholes, payoffAtMaturity, priceOption, greeks
│   ├── simulation.ts    # generatePayoffCurve, generatePricePath, simulateRebalancing
│   └── __tests__/       # 24 unit tests
├── components/          # React components
│   ├── Layout.tsx
│   ├── ParameterPanel.tsx
│   ├── PayoffChart.tsx
│   ├── GreeksChart.tsx
│   └── RebalanceSimulator.tsx
├── hooks/
│   └── useEthPrice.ts   # Live ETH/USD price feed
├── App.tsx              # Main app layout
├── main.tsx             # Entry point
└── index.css            # Global styles + dark theme
```

## Deploy to Cloudflare Pages

```bash
# One-time: set your API token
export CLOUDFLARE_API_TOKEN=your_token_here

# Build + Deploy
npm run build
npx wrangler pages deploy dist --project-name=options-synth-sim
```

Or connect GitHub repo in Cloudflare Dashboard for auto-deploy on push.

## Design Decisions

- **Pure TypeScript engine** — All pricing/simulation logic is in `src/engine/` with zero runtime dependencies. Testable without React.
- **Numeraire conversion** — N is priced as a USD put option via Black-Scholes + put-call parity, then converted to ETH terms by dividing by current price.
- **Greeks via finite differences** — Delta/Gamma computed with 0.1% price bumps; Theta via 1-day time bump.
- **Edge cases handled** — σ=0, T≤0, currentPrice≤0, deep ITM/OTM extremes.

## License

MIT

## Credits

Built on [Vitalik Buterin's ethresear.ch post](https://ethresear.ch/t/building-index-tracking-assets-on-top-of-options-instead-of-debt/25036) (June 2026).

Special thanks to Vladimir Novakovski, Curve developers, and the ethresear.ch community for the discussion.