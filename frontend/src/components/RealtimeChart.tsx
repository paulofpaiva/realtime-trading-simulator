import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Maximize2, Minimize2 } from "lucide-react"
import type { PricePoint } from "@/hooks/useTradingHub"

type RealtimeChartProps = {
  data: PricePoint[]
  symbol: string | null
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  } catch {
    return iso
  }
}

export function RealtimeChart({ data, symbol }: RealtimeChartProps) {
  const [expanded, setExpanded] = useState(false)

  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    return sorted.map((p, i) => ({
      ...p,
      index: i,
      timeLabel: formatTime(p.time),
    }))
  }, [data])

  if (!symbol) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-slate-100/50 text-slate-500 dark:bg-slate-800/30 dark:text-slate-400">
        Select a symbol to view the chart
      </div>
    )
  }

  const chartHeight = expanded ? 450 : 300

  const chartContent = (
    <ResponsiveContainer width="100%" height={chartHeight} minHeight={chartHeight}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(203 213 225)" className="dark:stroke-slate-600" />
        <XAxis
          dataKey="index"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => chartData[Number(val)]?.timeLabel ?? ""}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.toFixed(2)}
          domain={["auto", "auto"]}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgb(248 250 252)",
            border: "1px solid rgb(226 232 240)",
            borderRadius: "8px",
          }}
          labelFormatter={(_, payload) =>
            (payload?.[0] as { payload?: { timeLabel?: string } } | undefined)?.payload?.timeLabel ?? ""
          }
          formatter={(value: unknown) => [
            typeof value === "number" ? `$${value.toFixed(2)}` : String(value),
            "Price",
          ]}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="rgb(16 185 129)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <div className="relative w-full" style={{ minHeight: chartHeight }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="absolute right-2 top-2 z-10 rounded-lg border border-slate-200 bg-white/90 p-2 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/90 dark:hover:bg-slate-700"
        title={expanded ? "Shrink" : "Expand / Zoom"}
        aria-label={expanded ? "Shrink chart" : "Expand chart"}
      >
        {expanded ? (
          <Minimize2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        ) : (
          <Maximize2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        )}
      </button>
      {expanded ? (
        <div className="fixed inset-4 z-50 flex flex-col rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {symbol} — Zoomed view
            </span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Close
            </button>
          </div>
          <div className="flex-1 p-4" style={{ minHeight: chartHeight }}>
            {chartContent}
          </div>
        </div>
      ) : (
        chartContent
      )}
    </div>
  )
}
