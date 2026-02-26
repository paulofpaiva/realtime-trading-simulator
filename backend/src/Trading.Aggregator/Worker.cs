using System.Collections.Concurrent;
using System.Text.Json;
using Confluent.Kafka;
using Trading.Contracts;

namespace Trading.Aggregator;

public class Worker : BackgroundService
{
    private const int WindowSeconds = 5;

    private readonly ILogger<Worker> _logger;
    private readonly IProducer<string, string> _producer;
    private readonly IConfiguration _configuration;
    private readonly ConcurrentDictionary<string, List<(DateTime Timestamp, decimal Price)>> _windows = new();

    public Worker(
        ILogger<Worker> logger,
        IProducer<string, string> producer,
        IConfiguration configuration)
    {
        _logger = logger;
        _producer = producer;
        _configuration = configuration;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        return Task.Run(() => RunConsumeLoop(stoppingToken), stoppingToken);
    }

    private void RunConsumeLoop(CancellationToken stoppingToken)
    {
        var bootstrapServers = _configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
        var assetPriceTopic = _configuration["Kafka:AssetPriceTopic"] ?? "asset-price";
        var assetAnalyticsTopic = _configuration["Kafka:AssetAnalyticsTopic"] ?? "asset-analytics";
        var consumerGroup = _configuration["Kafka:ConsumerGroup"] ?? "trading-aggregator";

        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = bootstrapServers,
            GroupId = consumerGroup,
            AutoOffsetReset = AutoOffsetReset.Latest,
            EnableAutoCommit = true
        };

        using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
        consumer.Subscribe(assetPriceTopic);
        _logger.LogInformation("Aggregator started. Consuming from {Topic}, producing to {AnalyticsTopic}", assetPriceTopic, assetAnalyticsTopic);

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var cr = consumer.Consume(TimeSpan.FromSeconds(5));
                    if (cr == null) continue;

                    var priceJson = cr.Message.Value;
                    if (string.IsNullOrEmpty(priceJson)) continue;

                    var priceEvent = JsonSerializer.Deserialize<AssetPrice>(priceJson);
                    if (priceEvent == null) continue;

                    var symbol = priceEvent.Symbol;
                    var price = priceEvent.Price;
                    var timestamp = priceEvent.Timestamp;

                    var window = _windows.GetOrAdd(symbol, _ => new List<(DateTime, decimal)>());
                    lock (window)
                    {
                        window.Add((timestamp, price));
                        var cutoff = DateTime.UtcNow.AddSeconds(-WindowSeconds);
                        while (window.Count > 0 && window[0].Timestamp < cutoff)
                            window.RemoveAt(0);

                        if (window.Count == 0) continue;

                        var lastPrice = window[^1].Price;
                        var movingAvg = window.Average(x => x.Price);
                        var volatility = ComputeVolatility(window.Select(x => x.Price).ToList());

                        var analytics = new AssetAnalytics(
                            symbol,
                            (double)lastPrice,
                            (double)movingAvg,
                            (double)volatility,
                            DateTime.UtcNow.ToString("o")
                        );

                        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                        var analyticsJson = JsonSerializer.Serialize(analytics, options);
                        _producer.Produce(assetAnalyticsTopic, new Message<string, string>
                        {
                            Key = symbol,
                            Value = analyticsJson
                        });
                    }
                }
                catch (ConsumeException ex)
                {
                    _logger.LogWarning(ex, "Consume error: {Reason}", ex.Error.Reason);
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Error processing price message.");
                }
            }
        }
        finally
        {
            consumer.Close();
        }

        _logger.LogInformation("Aggregator stopping.");
    }


    private static decimal ComputeVolatility(IList<decimal> prices)
    {
        if (prices.Count < 2) return 0;
        var avg = prices.Average();
        var sumSq = prices.Sum(p => (p - avg) * (p - avg));
        var variance = sumSq / (prices.Count - 1);
        return (decimal)Math.Sqrt((double)variance);
    }
}
