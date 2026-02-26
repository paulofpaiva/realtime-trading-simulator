import { useState, useMemo } from "react"
import { useTradingHub } from "@/hooks/useTradingHub"
import { useHistoricalAnalytics } from "@/hooks/useHistoricalAnalytics"
import { SymbolSelect } from "@/components/SymbolSelect"
import { PriceSummary } from "@/components/PriceSummary"
import { RealtimeChart } from "@/components/RealtimeChart"
import { ChartFilters } from "@/components/ChartFilters"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import type { PricePoint } from "@/hooks/useTradingHub"

function mergePoints(historical: PricePoint[], realtime: PricePoint[]): PricePoint[] {
  if (realtime.length === 0) return historical
  const lastHistoricalTime = historical.at(-1)?.time
  const newerRealtime = lastHistoricalTime
    ? realtime.filter((p) => p.time > lastHistoricalTime)
    : realtime
  return [...historical, ...newerRealtime]
}

function App() {
  const [symbol, setSymbol] = useState<string | null>("BTC")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [filtersApplied, setFiltersApplied] = useState(false)

  const { connectionState, pointsBySymbol, lastUpdateBySymbol } = useTradingHub()

  const filters = useMemo(() => {
    if (!filtersApplied) return { limit: 500 }
    const f: { from?: string; to?: string; limit: number } = { limit: 5000 }
    if (filterFrom) f.from = new Date(filterFrom).toISOString()
    if (filterTo) f.to = new Date(filterTo).toISOString()
    return f
  }, [filtersApplied, filterFrom, filterTo])

  const { points: historicalPoints, loading: historicalLoading, error: historicalError } = useHistoricalAnalytics(symbol, filters)

  const realtimePoints = symbol ? (pointsBySymbol[symbol] ?? []) : []
  const chartPoints = filtersApplied ? historicalPoints : mergePoints(historicalPoints, realtimePoints)

  const lastForSymbol = symbol ? lastUpdateBySymbol[symbol] ?? null : null

  const handleApplyFilters = () => setFiltersApplied(true)
  const handleClearFilters = () => {
    setFilterFrom("")
    setFilterTo("")
    setFiltersApplied(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6 md:py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
              Real Time Trading Simulator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live price streaming with Kafka & SignalR
            </p>
          </div>
          <ConnectionStatus state={connectionState} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select Symbol
              </label>
              <SymbolSelect value={symbol} onValueChange={setSymbol} />
            </div>
            <PriceSummary analytics={lastForSymbol} symbol={symbol} />
          </aside>

          <section className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/50 px-5 py-4 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-800/30">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Price Chart
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {filtersApplied ? "Historical" : "Real-time"} for {symbol ?? "selected symbol"}
                </p>
                <div className="mt-4">
                  <ChartFilters
                    from={filterFrom}
                    to={filterTo}
                    onFromChange={setFilterFrom}
                    onToChange={setFilterTo}
                    onApply={handleApplyFilters}
                    onClear={handleClearFilters}
                  />
                </div>
              </div>
              <div className="p-5">
                {historicalError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                    {historicalError}
                  </div>
                )}
                {historicalLoading && chartPoints.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-slate-400">
                    Loading data...
                  </div>
                ) : (
                  <RealtimeChart data={chartPoints} symbol={symbol} />
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
