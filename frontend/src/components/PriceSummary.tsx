import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { AssetAnalytics } from "@/types/analytics"

type PriceSummaryProps = {
  analytics: AssetAnalytics | null
  symbol: string | null
}

export function PriceSummary({ analytics, symbol }: PriceSummaryProps) {
  if (!symbol) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <span className="text-muted-foreground">Select a symbol</span>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <span className="text-sm font-medium text-muted-foreground">{symbol}</span>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last</span>
          <span className="font-mono tabular-nums">
            {analytics ? analytics.lastPrice.toFixed(2) : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">5s average</span>
          <span className="font-mono tabular-nums">
            {analytics ? analytics.movingAverage5s.toFixed(2) : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Volatility</span>
          <span className="font-mono tabular-nums">
            {analytics ? analytics.volatility.toFixed(4) : "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
