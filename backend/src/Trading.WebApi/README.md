# Trading.WebApi

SignalR hub + Kafka consumer for the trading simulator frontend.

## Run

**Recommended** (build first, then run without rebuild — avoids long "Building..." with no output):

```bash
# from backend/src/Trading.WebApi
dotnet build
dotnet run --no-build
```

When the app is ready you'll see: `WebApi: ready at http://localhost:5001/tradingHub`

**Single command from this folder:**

```bash
dotnet run
```

**From repo root** (use this path only when your current directory is the repo root):

```bash
dotnet run --project backend/src/Trading.WebApi/Trading.WebApi.csproj
```
