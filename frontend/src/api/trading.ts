const API_BASE =
  import.meta.env.VITE_API_URL ?? (typeof window !== "undefined" ? "/api" : "http://localhost:5001/api")

export interface SymbolDto {
  symbol: string
  displayName: string
}

export interface AnalyticsDto {
  symbol: string
  lastPrice: number
  movingAverage5s: number
  volatility: number
  timestamp: string
}

export async function fetchSymbols(): Promise<SymbolDto[]> {
  const res = await fetch(`${API_BASE}/symbols`)
  if (!res.ok) throw new Error("Error al cargar símbolos")
  return res.json()
}

export async function fetchAnalytics(
  symbol: string,
  opts?: { from?: string; to?: string; limit?: number }
): Promise<AnalyticsDto[]> {
  const params = new URLSearchParams()
  if (opts?.from) params.set("from", opts.from)
  if (opts?.to) params.set("to", opts.to)
  if (opts?.limit) params.set("limit", String(opts.limit))
  const qs = params.toString()
  const url = `${API_BASE}/analytics/${encodeURIComponent(symbol)}${qs ? `?${qs}` : ""}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Error al cargar datos históricos")
  const data = await res.json()
  return data.map((a: AnalyticsDto) => ({
    ...a,
    timestamp: typeof a.timestamp === "string" ? a.timestamp : new Date(a.timestamp).toISOString(),
  }))
}
