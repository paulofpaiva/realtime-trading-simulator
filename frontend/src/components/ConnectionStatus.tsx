import { HubConnectionState } from "@microsoft/signalr"

type ConnectionStatusProps = {
  state: HubConnectionState
}

const labels: Record<HubConnectionState, string> = {
  [HubConnectionState.Connected]: "Connected",
  [HubConnectionState.Connecting]: "Connecting…",
  [HubConnectionState.Disconnected]: "Disconnected",
  [HubConnectionState.Disconnecting]: "Disconnecting…",
  [HubConnectionState.Reconnecting]: "Reconnecting…",
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
    <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-800/60">
      <span
        className={`inline-block h-2 w-2 rounded-full ${colors[state]}`}
        aria-hidden
      />
      <span className="font-medium text-slate-700 dark:text-slate-300">{labels[state]}</span>
    </div>
  )
}
