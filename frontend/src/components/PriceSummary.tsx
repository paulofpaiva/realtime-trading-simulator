import { Activity, DollarSign, TrendingUp } from "lucide-react"
import type { AssetAnalytics } from "@/types/analytics"

type PriceSummaryProps = {
  analytics: AssetAnalytics | null
  symbol: string | null
}

const metricCards = [
  {
    key: "lastPrice",
    label: "Last Price",
    icon: DollarSign,
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    format: (v: number) => `$${v.toFixed(2)}`,
  },
  {
    key: "movingAverage5s",
    label: "5s Average",
    icon: TrendingUp,
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    format: (v: number) => `$${v.toFixed(2)}`,
  },
  {
    key: "volatility",
    label: "Volatility",
    icon: Activity,
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    format: (v: number) => v.toFixed(4),
  },
] as const

export function PriceSummary({ analytics, symbol }: PriceSummaryProps) {
  if (!symbol) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-sm text-slate-500 dark:text-slate-400">Select a symbol to view metrics</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {metricCards.map(({ key, label, icon: Icon, bgColor, format }) => {
        const value = analytics ? (analytics[key] as number) : null
        return (
          <div
            key={key}
            className={`rounded-xl border border-slate-200/80 p-4 shadow-sm dark:border-slate-800 ${bgColor}`}
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {label}
              </p>
            </div>
            <p className="font-mono text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
              {value != null ? format(value) : "—"}
            </p>
          </div>
        )
      })}
    </div>
  )
}
