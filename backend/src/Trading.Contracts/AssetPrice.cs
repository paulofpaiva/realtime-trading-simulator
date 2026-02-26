namespace Trading.Contracts;

public sealed class AssetPrice
{
    public required string Symbol { get; init; }
    public decimal Price { get; init; }
    public DateTime Timestamp { get; init; }
}
