# Real-Time Trading Simulator

Simulador de preços de ativos em tempo real: gera cotações sintéticas, agrega métricas (média móvel, volatilidade) via Kafka e entrega atualizações ao cliente via SignalR. Pensado para demonstração de arquitetura event-driven com .NET, Kafka e React.

---

## O que o app faz

- **Gera preços simulados** para os símbolos **BTC**, **ETH**, **AAPL** e **TSLA** a cada 50 ms, com random walk entre −0,5% e +0,5%.
- **Publica** cada preço no tópico Kafka `asset-price` (chave = símbolo).
- **Agregador** consome `asset-price`, mantém janela deslizante de 5 segundos por símbolo e calcula:
  - último preço,
  - média móvel 5s,
  - volatilidade (desvio padrão na janela).
- **Publica** essas métricas no tópico `asset-analytics`.
- **Web API** consome `asset-analytics` e envia cada atualização para todos os clientes conectados via **SignalR** (método `ReceivePriceUpdate`).
- **(Em construção)** Frontend React conectado ao hub SignalR para exibir gráficos em tempo real.

---

## Stack

| Camada        | Tecnologia |
|---------------|------------|
| Backend       | .NET 9, ASP.NET Core, SignalR, Confluent.Kafka, BackgroundService |
| Contratos     | `Trading.Contracts` (AssetPrice, AssetAnalytics) |
| Serviços      | Trading.PriceGenerator, Trading.Aggregator, Trading.WebApi |
| Frontend      | React 18+, Vite, TypeScript, SignalR client, Recharts ou ApexCharts (planejado) |
| Infra         | Kafka, Zookeeper, Kafka UI, PostgreSQL 16, Docker / Docker Compose |
| Configuração  | `.env` (portas, credenciais); appsettings nos projetos .NET |

---

## Arquitetura (fluxo de dados)

```
PriceGenerator  →  [Kafka: asset-price]  →  Aggregator  →  [Kafka: asset-analytics]  →  WebApi  →  SignalR Hub  →  (Frontend)
```

- **PriceGenerator**: Worker que publica em `asset-price`.
- **Aggregator**: Consumidor de `asset-price`, publicador em `asset-analytics`.
- **WebApi**: Consumidor de `asset-analytics`, hub SignalR em `/tradingHub`, broadcast `ReceivePriceUpdate`.

---

## Estrutura do repositório

```
realtime-trading-simulator/
├── backend/                    # Solução .NET 9
│   ├── TradingSimulator.sln
│   └── src/
│       ├── Trading.Contracts/  # Modelos AssetPrice, AssetAnalytics
│       ├── Trading.PriceGenerator/
│       ├── Trading.Aggregator/
│       └── Trading.WebApi/     # API + SignalR hub
├── frontend/                   # React + Vite (em construção)
├── infra/                      # Docker Compose (Kafka, Zookeeper, Kafka UI, Postgres)
├── .env.example                # Variáveis de ambiente de exemplo
├── .env                        # Suas variáveis (não versionado)
└── README.MD
```

---

## Pré-requisitos

- **Docker** e **Docker Compose v2** (para infraestrutura).
- **.NET 9 SDK** (para rodar os serviços backend localmente).
- *(Opcional)* Node.js 18+ quando o frontend estiver disponível.

---

## Como rodar

### 1. Subir a infraestrutura (Docker)

Na raiz do repositório:

```bash
cp .env.example .env
cd infra
docker compose up -d
```

Isso sobe:

- **Zookeeper** (porta 2181)
- **Kafka** (9092 para clientes no host, 29092 interno)
- **Kafka UI** (8080)
- **PostgreSQL** (5432, DB `trading`, user/senha conforme `.env`)

Verificar containers:

```bash
docker compose ps
```

### 2. Rodar os serviços backend (desenvolvimento local)

Com a infraestrutura no ar, abra **três terminais** na raiz do repo:

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

A WebApi expõe o hub SignalR em `http://localhost:5000/tradingHub` (ou na porta configurada em `ASPNETCORE_URLS`).

### 3. Conferir o fluxo

- **Kafka UI**: `http://localhost:8080`  
  - Tópicos `asset-price` e `asset-analytics` devem receber mensagens em tempo real.
- **PostgreSQL**: `localhost:5432`, database `trading`, usuário/senha do `.env` (por padrão `trading`/`trading`).

Quando o frontend estiver pronto, ele se conectará ao hub e exibirá os gráficos em tempo real.

---

## Variáveis de ambiente (`.env`)

O arquivo `.env.example` lista as variáveis usadas pelo `infra/docker-compose.yml`:

| Variável              | Descrição                         | Padrão  |
|------------------------|-----------------------------------|---------|
| ZOOKEEPER_PORT         | Porta do Zookeeper                | 2181    |
| KAFKA_EXTERNAL_PORT    | Porta do Kafka (host)             | 9092    |
| KAFKA_INTERNAL_PORT    | Porta do Kafka (rede Docker)      | 29092   |
| KAFKA_UI_PORT          | Porta do Kafka UI                 | 8080    |
| POSTGRES_DB            | Nome do banco PostgreSQL          | trading |
| POSTGRES_USER          | Usuário PostgreSQL                | trading |
| POSTGRES_PASSWORD      | Senha PostgreSQL                  | trading |
| POSTGRES_PORT          | Porta do PostgreSQL               | 5432    |
| WEBAPI_PORT            | Porta da WebApi (futuro)          | 5000    |
| FRONTEND_PORT          | Porta do frontend (futuro)        | 5173    |

Copie `.env.example` para `.env` e ajuste se necessário. Os serviços .NET leem Kafka e Postgres via `appsettings.json` (e, em Docker, via variáveis de ambiente quando configurado).

---

## Portas em uso

| Serviço        | Porta (padrão) | Uso                    |
|----------------|----------------|------------------------|
| Zookeeper      | 2181           | Kafka coordination     |
| Kafka          | 9092           | Clientes no host       |
| Kafka (interno)| 29092          | Clientes na rede Docker|
| Kafka UI       | 8080           | Interface web          |
| PostgreSQL     | 5432           | Banco de dados         |
| WebApi         | 5000           | API + SignalR hub      |
| Frontend       | 5173           | App React (futuro)      |

---

## Desenvolvimento

- **Backend**: alterações na branch `backend-feats`; merge para `main` quando estável.
- **Frontend**: alterações na branch `frontend-feats`.
- Build da solução: `cd backend && dotnet build`.
- Mensagens e UI de erro devem estar em **espanhol**; código (nomes, tipos) em **inglês**.

---

## Licença

Uso conforme definido no repositório.
