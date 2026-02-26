import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSymbols } from "@/hooks/useSymbols"

type SymbolSelectProps = {
  value: string | null
  onValueChange: (s: string) => void
  disabled?: boolean
}

export function SymbolSelect({ value, onValueChange, disabled }: SymbolSelectProps) {
  const { symbols, loading, error } = useSymbols()

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
        {error}
      </div>
    )
  }

  return (
    <Select
      value={value ?? undefined}
      onValueChange={onValueChange}
      disabled={disabled || loading}
    >
      <SelectTrigger className="w-full border-slate-200 bg-slate-50 font-medium dark:border-slate-700 dark:bg-slate-800/50">
        <SelectValue placeholder={loading ? "Loading..." : "Select symbol"} />
      </SelectTrigger>
      <SelectContent>
        {symbols.map((s) => (
          <SelectItem key={s.symbol} value={s.symbol}>
            {s.displayName} ({s.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
