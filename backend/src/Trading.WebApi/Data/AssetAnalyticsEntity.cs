namespace Trading.WebApi.Data;

public class AssetAnalyticsEntity
{
    public long Id { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public double LastPrice { get; set; }
    public double MovingAverage5s { get; set; }
    public double Volatility { get; set; }
    public DateTime Timestamp { get; set; }
}
