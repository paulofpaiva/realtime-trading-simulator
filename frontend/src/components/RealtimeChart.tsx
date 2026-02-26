import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
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
  const chartData = data.map((p) => ({
    ...p,
    timeLabel: formatTime(p.time),
  }))

  if (!symbol) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-slate-100/50 text-slate-500 dark:bg-slate-800/30 dark:text-slate-400">
        Selecciona un símbolo para ver el gráfico
      </div>
    )
  }

  const chartHeight = 300
  return (
    <div className="w-full" style={{ minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height={chartHeight} minHeight={chartHeight}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="timeLabel"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(2)}
            domain={["auto", "auto"]}
          />
          <Tooltip
            labelFormatter={(_, payload) =>
              (payload?.[0] as { payload?: { timeLabel?: string } } | undefined)?.payload?.timeLabel ?? ""
            }
            formatter={(value: unknown) => [
              typeof value === "number" ? value.toFixed(2) : String(value),
              "Price",
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            name="Price"
            stroke="rgb(16 185 129)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
