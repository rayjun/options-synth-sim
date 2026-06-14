export const LANGUAGES = ['en', 'zh'] as const
export type Lang = (typeof LANGUAGES)[number]

// Flat key-value translations for the entire app
type Dict = Record<string, string>

export const dict: Record<Lang, Dict> = {
  en: {
    'app.title': 'Options Synth Sim',
    'app.subtitle': 'Option-Based Synthetic Asset Simulator',
    'app.attribution': "Based on Vitalik's ethresear.ch post →",
    'app.footer': "Built on Vitalik Buterin's ethresear.ch post — P+N=1 ETH. No liquidations. Slow oracles.",

    'params.heading': 'Parameters',
    'params.strike': 'Strike Price S',
    'params.currentPrice': 'Current Price T',
    'params.volatility': 'Volatility σ',
    'params.riskFreeRate': 'Risk-Free Rate r',
    'params.maturity': 'Maturity Date',
    'params.pLabel': 'P (Stable Side)',
    'params.nLabel': 'N (Speculative)',

    'payoff.prematurity': 'Pre-Maturity Valuation',
    'payoff.maturity': 'Payoff at Maturity',
    'payoff.pnInvariant': 'P+N=1 ETH',

    'greeks.heading': 'Greeks',
    'greeks.delta': 'Delta (×10³)',
    'greeks.gamma': 'Gamma (×10⁵)',
    'greeks.theta': 'Theta (×10)',

    'rebalance.heading': 'Rebalancing Simulation',
    'rebalance.threshold': 'Threshold',
    'rebalance.newPath': 'New Path',
    'rebalance.rebalances': 'Rebalances',
    'rebalance.trackingError': 'Tracking Error',
    'rebalance.finalPnl': 'Final PnL vs ETH',
    'rebalance.actionRebalanced': 'rebalanced',
    'rebalance.actionHold': 'hold',

    'price.ethUsd': 'ETH/USD',
    'price.stale': 'stale',
    'price.using': 'Using live price for simulations',

    'chart.priceAxis': 'Price T',
    'chart.valueAxis': 'ETH Value',
    'chart.pName': 'P (Stable)',
    'chart.nName': 'N (Speculative)',
    'chart.dayAxis': 'Day',
    'chart.ethPriceScaled': 'ETH Price (scaled)',
    'chart.pRebalanced': 'P Value (rebalanced)',
    'chart.rebalanceEvents': 'Rebalance Events',

    // --- Help tooltips ---
    'help.strike': 'The reference price S in the index T (e.g., USD/ETH). At maturity, if the actual price x is above S, P gets less than 1 ETH — the stable side loses protection. Choose S far below the current price for deep "in-the-money" safety.',
    'help.currentPrice': 'The current value of the index T (e.g., ETH/USD). This is automatically synced to the live ETH price from Binance.',
    'help.volatility': 'Annualized volatility σ (sigma). Higher σ means wider price swings. This increases the pre-maturity uncertainty — the N-put option is worth more when volatility is high, pushing P value down.',
    'help.riskFreeRate': 'Risk-free interest rate r used in Black-Scholes discounting. Typically 0–5% for USD. Raises the forward price of ETH, slightly affecting option values.',
    'help.maturity': 'The date M when the oracle resolves the index T and the P/N options settle. At maturity, payoffs are exactly min(1, S/x) for P and max(0, 1−S/x) for N.',
    'help.pValue': 'Current ETH-denominated value of the P token (stable side). P = 1 − N. Uses Black-Scholes put pricing converted to ETH.',
    'help.nValue': 'Current ETH-denominated value of the N token (speculative side). N is the risk-neutral value of a put option on T with strike S, divided by the spot price.',
    'help.payoff': 'Shows how the ETH value of P and N evolves as the index price T changes. The vertical dashed lines mark the strike S and the current spot price.',
    'help.greeks': 'Delta = sensitivity of P value to price changes. Gamma = rate of change of Delta (convexity). Theta = daily time decay of option value. All computed via Black-Scholes finite differences.',
    'help.rebalance': 'Simulates a 60-day Geometric Brownian Motion price path. When the price drops below S × threshold, the P holder "rotates" into a new option with a lower strike to restore stability. Each rebalance incurs ~0.2% slippage.',
    'help.trackingError': 'Deviation from perfect stability (P = 1 ETH). Higher means more drift from the desired hedge. Caused by time decay + slippage from rebalancing.',
    'help.finalPnl': 'How P performed compared to simply holding 1 ETH over the simulation. Positive = P outperformed ETH. Usually negative (you pay for stability).',
  },

  zh: {
    'app.title': '期权合成模拟器',
    'app.subtitle': '基于期权的合成资产模拟器',
    'app.attribution': '基于 Vitalik ethresear.ch 文章 →',
    'app.footer': '基于 Vitalik Buterin 的 ethresear.ch 文章 — P+N=1 ETH，无需清算，慢速预言机。',

    'params.heading': '参数',
    'params.strike': '行权价 S',
    'params.currentPrice': '指数 T 当前值',
    'params.volatility': '波动率 σ',
    'params.riskFreeRate': '无风险利率 r',
    'params.maturity': '到期日',
    'params.pLabel': 'P（稳定端）',
    'params.nLabel': 'N（投机端）',

    'payoff.prematurity': '到期前估值',
    'payoff.maturity': '到期结算',
    'payoff.pnInvariant': 'P+N=1 ETH',

    'greeks.heading': '风险指标',
    'greeks.delta': 'Delta (×10³)',
    'greeks.gamma': 'Gamma (×10⁵)',
    'greeks.theta': 'Theta (×10)',

    'rebalance.heading': '再平衡模拟',
    'rebalance.threshold': '触发阈值',
    'rebalance.newPath': '新路径',
    'rebalance.rebalances': '再平衡次数',
    'rebalance.trackingError': '追踪误差',
    'rebalance.finalPnl': '相对 ETH 表现',
    'rebalance.actionRebalanced': '换仓',
    'rebalance.actionHold': '持有',

    'price.ethUsd': 'ETH/美元',
    'price.stale': '过期',
    'price.using': '当前使用实时价格',

    'chart.priceAxis': '价格 T',
    'chart.valueAxis': 'ETH 价值',
    'chart.pName': 'P（稳定端）',
    'chart.nName': 'N（投机端）',
    'chart.dayAxis': '天数',
    'chart.ethPriceScaled': 'ETH 价格（缩放）',
    'chart.pRebalanced': 'P 价值（再平衡）',
    'chart.rebalanceEvents': '再平衡事件',

    // --- Help tooltips ---
    'help.strike': '在指数 T（如 USD/ETH）中的参考价格 S。到期时若实际价格 x 高于 S，P 将获得不足 1 ETH——稳定方的保护减弱。选择 S 远低于当前价格可获得深度的"价内"安全。',
    'help.currentPrice': '指数 T（如 ETH/USD）的当前值，自动同步 Binance 实时 ETH 价格。',
    'help.volatility': '年化波动率 σ。σ 越高意味着价格波动越大，到期前不确定性增加——N 看跌期权价值上升，P 价值下降。',
    'help.riskFreeRate': 'Black-Scholes 贴现中使用的无风险利率 r，通常 0–5%。会提高 ETH 远期价格，轻微影响期权价值。',
    'help.maturity': '预言机解析指数 T 并结算 P/N 期权的日期 M。到期时 payoff 精确为 P=min(1,S/x)、N=max(0,1−S/x)。',
    'help.pValue': 'P 代币（稳定端）当前的 ETH 计价价值。P = 1 − N，使用 Black-Scholes 看跌期权定价并转换为 ETH。',
    'help.nValue': 'N 代币（投机端）当前的 ETH 计价价值。N 是 T 上以 S 为行权价的看跌期权的风险中性价值除以现货价格。',
    'help.payoff': '展示 P 和 N 的 ETH 价值随指数价格 T 变化的曲线。竖虚线标记行权价 S 和当前价格。',
    'help.greeks': 'Delta = P 值对价格变化的敏感度（一阶导数）。Gamma = Delta 的变化率（凸度）。Theta = 每日时间衰减。全部通过 Black-Scholes 有限差分计算。',
    'help.rebalance': '模拟 60 天几何布朗运动价格路径。当价格跌破 S × 阈值，P 持有者"滚动"到更低行权价的新期权以恢复稳定性。每次再平衡产生约 0.2% 滑点。',
    'help.trackingError': '与完美稳定（P = 1 ETH）的偏差。越高意味着对冲漂移越大，由时间衰减 + 再平衡滑点造成。',
    'help.finalPnl': 'P 在模拟期间相对于简单持有 1 ETH 的表现。正值 = P 跑赢 ETH。通常为负（稳定性需要付出代价）。',
  },
}

export function t(lang: Lang, key: string): string {
  return dict[lang]?.[key] ?? dict.en[key] ?? key
}