using System.Text.Json;
using Confluent.Kafka;
using Trading.Contracts;

namespace Trading.PriceGenerator;

public class Worker : BackgroundService
{
    private static readonly string[] Symbols = ["BTC", "ETH", "AAPL", "TSLA"];

    private readonly ILogger<Worker> _logger;
    private readonly IProducer<string, string> _producer;
    private readonly string _topic;
    private readonly Dictionary<string, decimal> _lastPrices = new();
    private readonly Random _random = new();

    public Worker(
        ILogger<Worker> logger,
        IProducer<string, string> producer,
        IConfiguration configuration)
    {
        _logger = logger;
        _producer = producer;
        _topic = configuration["Kafka:AssetPriceTopic"] ?? "asset-price";

        // Initial prices mocked for now
        _lastPrices["BTC"] = 50_000m;
        _lastPrices["ETH"] = 3_000m;
        _lastPrices["AAPL"] = 180m;
        _lastPrices["TSLA"] = 250m;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Price generator started. Topic: {Topic}", _topic);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                foreach (var symbol in Symbols)
                {
                    var nextPrice = NextPrice(symbol);

                    var priceEvent = new AssetPrice
                    {
                        Symbol = symbol,
                        Price = nextPrice,
                        Timestamp = DateTime.UtcNow
                    };

                    var payload = JsonSerializer.Serialize(priceEvent);

                    await _producer.ProduceAsync(
                        _topic,
                        new Message<string, string>
                        {
                            Key = symbol,
                            Value = payload
                        });
                }
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error while generating or publishing prices.");
            }

            await Task.Delay(TimeSpan.FromMilliseconds(50), stoppingToken);
        }

        _logger.LogInformation("Price generator stopping.");
    }

    private decimal NextPrice(string symbol)
    {
        var current = _lastPrices[symbol];

        // Random walk in range [-0.5%, +0.5%]
        var deltaPercentage = (decimal)(_random.NextDouble() - 0.5) / 100m;
        var next = current * (1 + deltaPercentage);

        _lastPrices[symbol] = Math.Max(next, 0.01m);
        return _lastPrices[symbol];
    }
}
