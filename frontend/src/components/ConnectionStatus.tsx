import { HubConnectionState } from "@microsoft/signalr"

type ConnectionStatusProps = {
  state: HubConnectionState
}

const labels: Record<HubConnectionState, string> = {
  [HubConnectionState.Connected]: "Conectado",
  [HubConnectionState.Connecting]: "Conectando…",
  [HubConnectionState.Disconnected]: "Desconectado",
  [HubConnectionState.Disconnecting]: "Desconectando…",
  [HubConnectionState.Reconnecting]: "Reconectando…",
}

const colors: Record<HubConnectionState, string> = {
  [HubConnectionState.Connected]: "bg-green-500",
  [HubConnectionState.Connecting]: "bg-yellow-500",
  [HubConnectionState.Disconnected]: "bg-red-500",
  [HubConnectionState.Disconnecting]: "bg-yellow-500",
  [HubConnectionState.Reconnecting]: "bg-yellow-500",
}

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span
        className={`inline-block h-2 w-2 rounded-full ${colors[state]}`}
        aria-hidden
      />
      <span>{labels[state]}</span>
    </div>
  )
}
