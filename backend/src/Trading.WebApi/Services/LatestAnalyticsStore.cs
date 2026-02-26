using System.Collections.Concurrent;
using Trading.Contracts;

namespace Trading.WebApi.Services;

/// <summary>
/// Holds the latest analytics per symbol. Updated by Kafka worker, read by Hub for polling.
/// </summary>
public class LatestAnalyticsStore
{
    private readonly ConcurrentDictionary<string, AssetAnalytics> _bySymbol = new();

    public void Set(AssetAnalytics analytics) =>
        _bySymbol.AddOrUpdate(analytics.Symbol, analytics, (_, _) => analytics);

    public IReadOnlyDictionary<string, AssetAnalytics> GetAll() =>
        new Dictionary<string, AssetAnalytics>(_bySymbol);
}
