namespace Trading.Contracts;

public sealed class AssetAnalytics
{
    public required string Symbol { get; init; }
    public decimal LastPrice { get; init; }
    public decimal MovingAverage5s { get; init; }
    public decimal Volatility { get; init; }
    public DateTime Timestamp { get; init; }
}
