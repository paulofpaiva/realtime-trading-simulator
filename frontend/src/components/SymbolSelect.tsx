import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SYMBOLS, type Symbol } from "@/types/analytics"

type SymbolSelectProps = {
  value: Symbol | null
  onValueChange: (s: Symbol) => void
  disabled?: boolean
}

export function SymbolSelect({ value, onValueChange, disabled }: SymbolSelectProps) {
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(v) => v && onValueChange(v as Symbol)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full border-slate-200 bg-slate-50 font-medium dark:border-slate-700 dark:bg-slate-800/50">
        <SelectValue placeholder="Symbol" />
      </SelectTrigger>
      <SelectContent>
        {SYMBOLS.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
