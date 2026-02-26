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
          <span className="text-muted-foreground">Seleccione un símbolo</span>
        </CardHeader>
      </Card>
    )
  }

  const last = analytics?.symbol === symbol ? analytics : null
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <span className="text-sm font-medium text-muted-foreground">{symbol}</span>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Último</span>
          <span className="font-mono tabular-nums">
            {last ? last.lastPrice.toFixed(2) : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Media 5s</span>
          <span className="font-mono tabular-nums">
            {last ? last.movingAverage5s.toFixed(2) : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Volatilidad</span>
          <span className="font-mono tabular-nums">
            {last ? last.volatility.toFixed(4) : "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
