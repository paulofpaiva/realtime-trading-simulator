import { useEffect, useState } from "react"
import { fetchAnalytics, type AnalyticsDto } from "@/api/trading"
import type { PricePoint } from "@/hooks/useTradingHub"

function toPricePoint(a: AnalyticsDto): PricePoint {
  return {
    time: a.timestamp,
    price: a.lastPrice,
    ma: a.movingAverage5s,
    volatility: a.volatility,
  }
}

export function useHistoricalAnalytics(
  symbol: string | null,
  filters?: { from?: string; to?: string; limit?: number }
) {
  const [points, setPoints] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const from = filters?.from
  const to = filters?.to
  const limit = filters?.limit ?? 500

  useEffect(() => {
    if (!symbol) {
      setPoints([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchAnalytics(symbol, { from, to, limit })
      .then((data) => {
        if (!cancelled) setPoints(data.map(toPricePoint))
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error al cargar datos históricos")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [symbol, from, to, limit])

  return { points, loading, error }
}
