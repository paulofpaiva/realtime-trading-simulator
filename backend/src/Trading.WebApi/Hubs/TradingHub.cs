using Microsoft.AspNetCore.SignalR;
using Trading.WebApi.Services;

namespace Trading.WebApi.Hubs;

public class TradingHub : Hub
{
    private readonly LatestAnalyticsStore _store;

    public TradingHub(LatestAnalyticsStore store)
    {
        _store = store;
    }

    public Task<IEnumerable<object>> GetLatestAnalytics()
    {
        var all = _store.GetAll().Values.Select(a => (object)new
        {
            symbol = a.Symbol,
            lastPrice = a.LastPrice,
            movingAverage5s = a.MovingAverage5s,
            volatility = a.Volatility,
            timestamp = a.Timestamp
        });
        return Task.FromResult(all);
    }

    public override async Task OnConnectedAsync()
    {
        var all = _store.GetAll();
        foreach (var a in all.Values)
        {
            await Clients.Caller.SendAsync("ReceivePriceUpdate", new
            {
                symbol = a.Symbol,
                lastPrice = a.LastPrice,
                movingAverage5s = a.MovingAverage5s,
                volatility = a.Volatility,
                timestamp = a.Timestamp
            });
        }
        if (all.Count == 0)
        {
            await Clients.Caller.SendAsync("ReceivePriceUpdate", new
            {
                symbol = "BTC",
                lastPrice = 50000.0,
                movingAverage5s = 49900.0,
                volatility = 0.01,
                timestamp = DateTime.UtcNow.ToString("o")
            });
        }
        await base.OnConnectedAsync();
    }
}
