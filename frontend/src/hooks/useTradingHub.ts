import { useEffect, useSyncExternalStore } from "react"
import * as signalR from "@microsoft/signalr"
import type { AssetAnalytics } from "@/types/analytics"

const HUB_URL = import.meta.env.VITE_HUB_URL ?? "http://localhost:5001/tradingHub"
const MAX_POINTS_PER_SYMBOL = 100

export type PricePoint = { time: string; price: number; ma: number; volatility: number }

type Snapshot = {
  connectionState: signalR.HubConnectionState
  pointsBySymbol: Record<string, PricePoint[]>
  lastUpdateBySymbol: Record<string, AssetAnalytics>
}

const store: Snapshot = {
  connectionState: signalR.HubConnectionState.Disconnected,
  pointsBySymbol: {},
  lastUpdateBySymbol: {},
}

const subscribers = new Set<() => void>()

function emit() {
  for (const cb of subscribers) cb()
}

function toAnalytics(payload: unknown): AssetAnalytics | null {
  try {
    if (typeof payload === "string") {
      return toAnalytics(JSON.parse(payload))
    }

    if (!payload || typeof payload !== "object") return null
    const raw = payload as Record<string, unknown>

    const symbol = raw.symbol ?? raw.Symbol
    if (typeof symbol !== "string" || !symbol) return null

    return {
      symbol,
      lastPrice: Number(raw.lastPrice ?? raw.LastPrice ?? 0),
      movingAverage5s: Number(raw.movingAverage5s ?? raw.MovingAverage5s ?? 0),
      volatility: Number(raw.volatility ?? raw.Volatility ?? 0),
      timestamp: String(raw.timestamp ?? raw.Timestamp ?? ""),
    }
  } catch {
    return null
  }
}

let connection: signalR.HubConnection | null = null

function ensureConnection() {
  if (!connection) {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    conn.on("ReceivePriceUpdate", (payload: unknown) => {
      const analytics = toAnalytics(payload)
      if (!analytics) return

      const point: PricePoint = {
        time: analytics.timestamp,
        price: analytics.lastPrice,
        ma: analytics.movingAverage5s,
        volatility: analytics.volatility,
      }

      const current = store.pointsBySymbol[analytics.symbol] ?? []
      const nextPoints = [...current, point]
      if (nextPoints.length > MAX_POINTS_PER_SYMBOL) nextPoints.shift()

      store.pointsBySymbol = { ...store.pointsBySymbol, [analytics.symbol]: nextPoints }
      store.lastUpdateBySymbol = { ...store.lastUpdateBySymbol, [analytics.symbol]: analytics }
      emit()
    })

    conn.onreconnecting(() => {
      store.connectionState = conn.state
      emit()
    })
    conn.onreconnected(() => {
      store.connectionState = conn.state
      emit()
    })
    conn.onclose(() => {
      store.connectionState = conn.state
      emit()
    })

    connection = conn
  }

  const conn = connection
  if (!conn) return

  if (conn.state === signalR.HubConnectionState.Disconnected) {
    store.connectionState = signalR.HubConnectionState.Connecting
    emit()

    conn
      .start()
      .then(() => {
        store.connectionState = conn.state
        emit()
      })
      .catch((err) => {
        store.connectionState = signalR.HubConnectionState.Disconnected
        emit()

        // Ignore expected dev-only errors from React Strict Mode double-mount
        if (err?.message?.includes("negotiation") || err?.name === "AbortError") return
        // eslint-disable-next-line no-console
        console.error("[TradingHub] Failed to start connection:", err)
      })
  }
}

function subscribe(callback: () => void) {
  subscribers.add(callback)
  return () => {
    subscribers.delete(callback)
  }
}

function getSnapshot(): Snapshot {
  return store
}

function getServerSnapshot(): Snapshot {
  return {
    connectionState: signalR.HubConnectionState.Disconnected,
    pointsBySymbol: {},
    lastUpdateBySymbol: {},
  }
}

export function useTradingHub() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      ensureConnection()
    }
  }, [])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return snapshot
}
