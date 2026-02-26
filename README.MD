# Real-Time Trading Simulator

Real-time trading simulator using .NET 9, Kafka, SignalR, and React.

## Frontend (this branch)

- **Stack**: Vite, React 18, TypeScript, shadcn/ui, TanStack Query, Recharts, SignalR client.
- **Run**: `cd frontend && cp .env.example .env && npm install && npm run dev`. Open `http://localhost:5173`.
- **Env**: `VITE_HUB_URL` (default `http://localhost:5000`) — WebApi SignalR hub URL. Backend (PriceGenerator, Aggregator, WebApi) must be running for real-time data.