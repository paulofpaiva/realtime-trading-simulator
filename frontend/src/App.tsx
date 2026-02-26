import { useState } from "react"
import { useTradingHub } from "@/hooks/useTradingHub"
import { SymbolSelect } from "@/components/SymbolSelect"
import { PriceSummary } from "@/components/PriceSummary"
import { RealtimeChart } from "@/components/RealtimeChart"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import type { Symbol } from "@/types/analytics"

function App() {
  const [symbol, setSymbol] = useState<Symbol | null>("BTC")
  const { connectionState, pointsBySymbol, lastUpdate } = useTradingHub()
  const points = symbol ? pointsBySymbol[symbol] ?? [] : []

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Real-Time Trading Simulator</h1>
        <ConnectionStatus state={connectionState} />
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-muted-foreground">
              Symbol
            </label>
            <SymbolSelect value={symbol} onValueChange={setSymbol} />
          </div>
          <PriceSummary analytics={lastUpdate} symbol={symbol} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Real-time price and volatility
          </h2>
          <RealtimeChart data={points} symbol={symbol} />
        </div>
      </div>
    </div>
  )
}

export default App
