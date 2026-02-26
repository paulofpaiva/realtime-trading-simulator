/** Matches backend AssetAnalytics contract (UTC ISO 8601 timestamp). */
export interface AssetAnalytics {
  symbol: string
  lastPrice: number
  movingAverage5s: number
  volatility: number
  timestamp: string
}

export const SYMBOLS = ["BTC", "ETH", "AAPL", "TSLA"] as const
export type Symbol = (typeof SYMBOLS)[number]
