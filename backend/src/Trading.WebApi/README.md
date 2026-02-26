# Trading.WebApi

SignalR hub + Kafka consumer for the trading simulator frontend. Consumes analytics from `asset-analytics`, stores them in `LatestAnalyticsStore`, and exposes them via the hub for client polling.

## Prerequisites

- **Infrastructure** (Kafka, Zookeeper) running via `docker compose up -d` in `infra/`
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

## Endpoints

| Endpoint              | Description                                      |
|-----------------------|--------------------------------------------------|
| http://localhost:5001/tradingHub | SignalR hub (negotiate, WebSocket)        |
| http://localhost:5001/openapi/v1.json | OpenAPI spec (Development only) |

## Hub methods

- **GetLatestAnalytics** — Returns latest analytics per symbol (client polls every 300 ms)
- **ReceivePriceUpdate** — Server pushes initial data when client connects
