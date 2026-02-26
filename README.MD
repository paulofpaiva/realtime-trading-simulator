# Real-Time Trading Simulator

Real-time trading simulator using .NET 9, Kafka, SignalR, React, and PostgreSQL.

## Quick start (Docker)

Requirements:
- Docker Desktop (or compatible)
- Docker Compose v2

Steps:
1. Clone this repository.
2. Copy the environment example:
   - `cp .env.example .env`
3. Start the infrastructure:
   - `cd infra`
   - `docker compose up -d`
4. Access the tools:
   - Kafka UI: `http://localhost:8080`
   - PostgreSQL: `localhost:5432` (database `trading`, user `trading`, password `trading` by default).

At this stage, Kafka (broker + Zookeeper + UI) and PostgreSQL run entirely in Docker.  
The .NET services (`Trading.PriceGenerator`, `Trading.Aggregator`, `Trading.WebApi`) and the frontend will be added as Docker services in next steps; for now they can be run locally for development.

## Running backend services locally (development)

From the repository root:

```bash
cd backend
dotnet build
```

Then, in separate terminals:

- Price generator:
  - `cd backend/src/Trading.PriceGenerator`
  - `dotnet run`
- Aggregator:
  - `cd backend/src/Trading.Aggregator`
  - `dotnet run`

With both running and Kafka up via Docker, you will see:
- Topic `asset-price` receiving raw price events.
- Topic `asset-analytics` receiving aggregated analytics.