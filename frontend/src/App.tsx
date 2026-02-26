import { useState } from "react"
import { useTradingHub } from "@/hooks/useTradingHub"
import { SymbolSelect } from "@/components/SymbolSelect"
import { PriceSummary } from "@/components/PriceSummary"
import { RealtimeChart } from "@/components/RealtimeChart"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import type { Symbol } from "@/types/analytics"

function App() {
  const [symbol, setSymbol] = useState<Symbol | null>("BTC")
  const { connectionState, pointsBySymbol, lastUpdateBySymbol } = useTradingHub()
  const points = symbol ? pointsBySymbol[symbol] ?? [] : []
  const lastForSymbol = symbol ? lastUpdateBySymbol[symbol] ?? null : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6 md:py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
              Real-Time Trading Simulator
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
                  Real-time price updates for {symbol ?? "selected symbol"}
                </p>
              </div>
              <div className="p-5">
                <RealtimeChart data={points} symbol={symbol} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
