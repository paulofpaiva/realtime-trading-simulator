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
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Símbolo" />
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
