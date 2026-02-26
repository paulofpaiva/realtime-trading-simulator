import { useCallback, useEffect, useRef, useState } from "react"
import * as signalR from "@microsoft/signalr"
import type { AssetAnalytics } from "@/types/analytics"

const HUB_URL = import.meta.env.VITE_HUB_URL ?? "http://localhost:5000/tradingHub"
const MAX_POINTS_PER_SYMBOL = 100

export type PricePoint = { time: string; price: number; ma: number; volatility: number }

function parsePayload(value: string): AssetAnalytics | null {
  try {
    const raw = JSON.parse(value) as Record<string, unknown>
    return {
      symbol: String(raw.symbol ?? ""),
      lastPrice: Number(raw.lastPrice ?? 0),
      movingAverage5s: Number(raw.movingAverage5s ?? 0),
      volatility: Number(raw.volatility ?? 0),
      timestamp: String(raw.timestamp ?? ""),
    }
  } catch {
    return null
  }
}

export function useTradingHub() {
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  )
  const [pointsBySymbol, setPointsBySymbol] = useState<Record<string, PricePoint[]>>({})
  const [lastUpdate, setLastUpdate] = useState<AssetAnalytics | null>(null)
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  const appendPoint = useCallback((analytics: AssetAnalytics) => {
    const point: PricePoint = {
      time: analytics.timestamp,
      price: analytics.lastPrice,
      ma: analytics.movingAverage5s,
      volatility: analytics.volatility,
    }
    setPointsBySymbol((prev) => {
      const list = [...(prev[analytics.symbol] ?? []), point]
      if (list.length > MAX_POINTS_PER_SYMBOL) list.shift()
      return { ...prev, [analytics.symbol]: list }
    })
    setLastUpdate(analytics)
  }, [])

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build()

    connection.on("ReceivePriceUpdate", (value: string) => {
      const analytics = parsePayload(value)
      if (analytics) appendPoint(analytics)
    })

    connectionRef.current = connection

    connection.start().then(() => setConnectionState(connection.state)).catch(console.error)

    const handler = () => setConnectionState(connection.state)
    connection.onreconnecting(handler)
    connection.onreconnected(handler)
    connection.onclose(handler)

    return () => {
      connection.stop().catch(console.error)
      connectionRef.current = null
    }
  }, [appendPoint])

  return { connectionState, pointsBySymbol, lastUpdate }
}
