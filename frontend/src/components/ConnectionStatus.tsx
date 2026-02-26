import type { HubConnectionState } from "@microsoft/signalr"

type ConnectionStatusProps = {
  state: HubConnectionState
}

const labels: Record<HubConnectionState, string> = {
  Connected: "Connected",
  Connecting: "Connecting…",
  Disconnected: "Disconnected",
  Disconnecting: "Disconnecting…",
  Reconnecting: "Reconnecting…",
}

const colors: Record<HubConnectionState, string> = {
  Connected: "bg-green-500",
  Connecting: "bg-yellow-500",
  Disconnected: "bg-red-500",
  Disconnecting: "bg-yellow-500",
  Reconnecting: "bg-yellow-500",
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
