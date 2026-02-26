import { useCallback, useEffect, useRef, useState } from "react"
import * as signalR from "@microsoft/signalr"
import type { AssetAnalytics } from "@/types/analytics"

const HUB_URL = import.meta.env.VITE_HUB_URL ?? "http://localhost:5001/tradingHub"
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
  const [lastUpdateBySymbol, setLastUpdateBySymbol] = useState<Record<string, AssetAnalytics>>({})
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const hasReceivedRef = useRef(false)
  const receiveCountRef = useRef(0)

  const appendPoint = useCallback((analytics: AssetAnalytics) => {
    if (!hasReceivedRef.current && import.meta.env.DEV) {
      hasReceivedRef.current = true
      console.info("[TradingHub] First price update received:", analytics.symbol)
    }
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
    setLastUpdateBySymbol((prev) => ({ ...prev, [analytics.symbol]: analytics }))
  }, [])

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on("ReceivePriceUpdate", (...args: unknown[]) => {
      const n = receiveCountRef.current + 1
      receiveCountRef.current = n
      if (n <= 3) {
        console.info("[TradingHub] ReceivePriceUpdate #" + n, "args length:", args?.length, "arg0 type:", typeof args?.[0], args?.[0])
      }
      const raw = args[0]
      const value = typeof raw === "string" ? raw : JSON.stringify(raw)
      const analytics = typeof raw === "object" && raw !== null
        ? parsePayload(JSON.stringify(raw))
        : parsePayload(value)
      if (!analytics && n <= 3) {
        console.warn("[TradingHub] parsePayload returned null for value:", value?.slice?.(0, 100))
      }
      if (analytics) appendPoint(analytics)
    })

    connectionRef.current = connection

    connection
      .start()
      .then(() => {
        if (connectionRef.current === connection) setConnectionState(connection.state)
      })
      .catch((err) => {
        // Ignore "stopped during negotiation" from React Strict Mode double-mount
        if (err?.message?.includes("negotiation") || err?.name === "AbortError") return
        console.error(err)
      })

    const handler = () => {
      if (connectionRef.current === connection) setConnectionState(connection.state)
    }
    connection.onreconnecting(handler)
    connection.onreconnected(handler)
    connection.onclose(handler)

    return () => {
      connectionRef.current = null
      // Delay stop so we don't abort during negotiation (React Strict Mode mounts, unmounts, remounts)
      setTimeout(() => {
        connection
          .stop()
          .catch((err) => {
            if (err?.message?.includes("negotiation") || err?.name === "AbortError") return
            console.error(err)
          })
      }, 200)
    }
  }, [appendPoint])

  return { connectionState, pointsBySymbol, lastUpdateBySymbol }
}
