namespace Trading.Contracts;

public record AssetAnalytics(
    string Symbol,
    double LastPrice,
    double MovingAverage5s,
    double Volatility,
    string Timestamp
);
