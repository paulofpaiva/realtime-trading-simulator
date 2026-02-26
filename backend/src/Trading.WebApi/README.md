# Trading.WebApi

SignalR hub + Kafka consumer + REST API for the trading simulator frontend. Consumes analytics from `asset-analytics`, stores them in `LatestAnalyticsStore`, and exposes them via the hub for client polling. Persists every analytics message to PostgreSQL and exposes REST endpoints for historical data and symbols.

## Prerequisites

- **Infrastructure** (Kafka, Zookeeper, PostgreSQL) running via `docker compose up -d` in `infra/`
- **PriceGenerator** and **Aggregator** running (they produce data to Kafka)

## Run

From this folder:

```bash
dotnet run
```

From repo root:

```bash
dotnet run --project backend/src/Trading.WebApi/Trading.WebApi.csproj
```

When ready you'll see: `WebApi: ready at http://localhost:5001/tradingHub (frontend: http://localhost:5173)`

## Database

- **PostgreSQL**: Connection string in `appsettings.json` or env `ConnectionStrings__Postgres` (default `Host=localhost;Database=trading;Username=trading;Password=trading`).
- **Tables**: `asset_analytics` (price history), `symbols` (seeded with BTC, ETH, AAPL, TSLA).
- **Persistence**: `AnalyticsConsumerWorker` appends every Kafka message to `asset_analytics`.
- **Schema**: Created automatically on startup via `EnsureCreated` and `DbInitializer.EnsureSymbolsTable`.

## Endpoints

| Endpoint              | Description                                      |
|-----------------------|--------------------------------------------------|
| http://localhost:5001/tradingHub | SignalR hub (negotiate, WebSocket)        |
| http://localhost:5001/api/symbols | GET — List symbols from DB              |
| http://localhost:5001/api/analytics/{symbol} | GET — Historical analytics (query params: `from`, `to`, `limit`) |
| http://localhost:5001/openapi/v1.json | OpenAPI spec (Development only) |

## Hub methods

- **GetLatestAnalytics** — Returns latest analytics per symbol (client polls every 300 ms)
- **ReceivePriceUpdate** — Server pushes initial data when client connects
