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
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground">
        Select a symbol to view the chart
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="timeLabel"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="price"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <YAxis
            yAxisId="vol"
            orientation="right"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(4)}
          />
          <Tooltip
            labelFormatter={(_, payload) =>
              (payload?.[0] as { payload?: { timeLabel?: string } } | undefined)?.payload?.timeLabel ?? ""
            }
            formatter={(value: unknown, name?: string) => [
              typeof value === "number" ? value.toFixed(name === "volatility" ? 4 : 2) : String(value),
              name === "price" ? "Price" : name === "ma" ? "5s average" : "Volatility",
            ]}
          />
          <Legend />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            name="Price"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="ma"
            name="5s average"
            stroke="var(--chart-2)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            yAxisId="vol"
            type="monotone"
            dataKey="volatility"
            name="Volatility"
            stroke="var(--chart-3)"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
