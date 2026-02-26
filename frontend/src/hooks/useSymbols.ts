import { useEffect, useState } from "react"
import { fetchSymbols, type SymbolDto } from "@/api/trading"

export function useSymbols() {
  const [symbols, setSymbols] = useState<SymbolDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchSymbols()
      .then((data) => {
        if (!cancelled) setSymbols(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load symbols")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { symbols, loading, error }
}
