# Real-Time Trading Simulator

Real-time asset price simulator: generates synthetic quotes, aggregates metrics (moving average, volatility) via Kafka, and delivers updates to clients via SignalR. Built to demonstrate an event-driven architecture with .NET, Kafka, and React.

---

## What the app does

- **Generates simulated prices** for **BTC**, **ETH**, **AAPL**, and **TSLA** every 50 ms, using a random walk between −0.5% and +0.5%.
- **Publishes** each price to the Kafka topic `asset-price` (key = symbol).
- **Aggregator** consumes `asset-price`, keeps a 5-second sliding window per symbol, and computes:
  - last price,
  - 5s moving average,
  - volatility (standard deviation over the window).
- **Publishes** these metrics to the `asset-analytics` topic.
- **Web API** consumes `asset-analytics`, stores latest analytics, and exposes them via **SignalR** hub (method `GetLatestAnalytics` for polling; `ReceivePriceUpdate` on connect).
- **React frontend** connects to the SignalR hub and polls every 300 ms for real-time charts.

---

## Stack

| Layer         | Technology |
|---------------|------------|
| Backend       | .NET 9, ASP.NET Core, SignalR, Confluent.Kafka, BackgroundService |
| Contracts     | `Trading.Contracts` (AssetPrice, AssetAnalytics) |
| Services      | Trading.PriceGenerator, Trading.Aggregator, Trading.WebApi |
| Frontend      | React 18+, Vite, TypeScript, SignalR client, Recharts |
| Infra         | Kafka, Zookeeper, Kafka UI, PostgreSQL 16, Docker / Docker Compose |
| Config        | `.env` (ports, credentials); appsettings in .NET projects |

---

## Architecture (data flow)

```
PriceGenerator  →  [Kafka: asset-price]  →  Aggregator  →  [Kafka: asset-analytics]  →  WebApi  →  SignalR Hub  →  Frontend
```

- **PriceGenerator**: Worker that publishes to `asset-price`.
- **Aggregator**: Consumer of `asset-price`, publisher to `asset-analytics`.
- **WebApi**: Consumer of `asset-analytics`, stores in `LatestAnalyticsStore`, SignalR hub at `/tradingHub` with `GetLatestAnalytics` (polling) and `ReceivePriceUpdate` (on connect).

---

## Repository structure

```
realtime-trading-simulator/
├── backend/                    # .NET 9 solution
│   ├── TradingSimulator.sln
│   └── src/
│       ├── Trading.Contracts/  # AssetPrice, AssetAnalytics models
│       ├── Trading.PriceGenerator/
│       ├── Trading.Aggregator/
│       └── Trading.WebApi/     # API + SignalR hub
├── frontend/                   # React + Vite
├── infra/                      # Docker Compose (Kafka, Zookeeper, Kafka UI, Postgres)
├── .env.example                # Example env vars (infra ports, etc.)
├── .env                        # Local env (not versioned, copy from .env.example)
└── README.MD
```

---

## Prerequisites

- **Docker** and **Docker Compose v2** (for infrastructure).
- **.NET 9 SDK** (to run backend services locally).
- **Node.js 18+** (for frontend).

---

## How to run

### 1. Start infrastructure (Docker)

From the repository root:

```bash
cp .env.example .env
cp .env infra/.env
cd infra
docker compose up -d
docker compose ps
```

Or, if you prefer a single `.env` in the root, run from `infra/` with: `docker compose --env-file ../.env up -d`.

This starts:

- **Zookeeper** (port 2181)
- **Kafka** (9092 for host clients, 29092 internal)
- **Kafka UI** (8080)
- **PostgreSQL** (5432, DB `trading`, user/password per `.env`)

### 2. Run backend services (local development)

With infrastructure up, open **three terminals** from the repo root. Start in this order:

**Terminal 1 – Price Generator**

```bash
cd backend/src/Trading.PriceGenerator
dotnet run
```

**Terminal 2 – Aggregator**

```bash
cd backend/src/Trading.Aggregator
dotnet run
```

**Terminal 3 – Web API (SignalR)**

```bash
cd backend/src/Trading.WebApi
dotnet run
```

The WebApi exposes the SignalR hub at `http://localhost:5001/tradingHub`.

### 3. Run frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. The default `VITE_HUB_URL` in `.env` is `http://localhost:5001/tradingHub`. Change it if the WebApi runs on a different host/port.

### 4. Verify the flow

- **Kafka UI**: `http://localhost:8080`  
  Topics `asset-price` and `asset-analytics` should receive messages in real time.
- **PostgreSQL**: `localhost:5432`, database `trading`, user/password from `.env` (default `trading`/`trading`).
- **Frontend**: `http://localhost:5173` — real-time charts and connection status.

---

## Environment variables (`.env`)

The `.env.example` file lists the variables used by `infra/docker-compose.yml`:

| Variable              | Description                      | Default |
|-----------------------|----------------------------------|---------|
| ZOOKEEPER_PORT        | Zookeeper port                   | 2181    |
| KAFKA_EXTERNAL_PORT   | Kafka port (host)                | 9092    |
| KAFKA_INTERNAL_PORT   | Kafka port (Docker network)      | 29092   |
| KAFKA_UI_PORT         | Kafka UI port                    | 8080    |
| POSTGRES_DB           | PostgreSQL database name         | trading |
| POSTGRES_USER         | PostgreSQL user                  | trading |
| POSTGRES_PASSWORD     | PostgreSQL password              | trading |
| POSTGRES_PORT         | PostgreSQL port                  | 5432    |
| WEBAPI_PORT           | WebApi port                      | 5001    |
| FRONTEND_PORT         | Frontend port                    | 5173    |

Frontend `frontend/.env`: `VITE_HUB_URL` — SignalR hub URL (default `http://localhost:5001/tradingHub`).

---

## Ports in use

| Service       | Port (default) | Purpose                |
|---------------|----------------|------------------------|
| Zookeeper     | 2181           | Kafka coordination     |
| Kafka         | 9092           | Host clients           |
| Kafka (internal) | 29092       | Docker network clients |
| Kafka UI      | 8080           | Web UI                 |
| PostgreSQL    | 5432           | Database               |
| WebApi        | 5001           | API + SignalR hub      |
| Frontend      | 5173           | React app               |

---

## Development

- **Backend**: changes on branch `backend-feats`; merge into `main` when stable.
- **Frontend**: changes on branch `frontend-feats`.
- Build solution: `cd backend && dotnet build`.
- Error messages and UI copy must be in **Spanish**; code (names, types) in **English**.

---

## License

As defined in the repository.
