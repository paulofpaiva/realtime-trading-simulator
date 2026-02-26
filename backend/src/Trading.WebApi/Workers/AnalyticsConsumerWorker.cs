using System.Text.Json;
using Confluent.Kafka;
using Trading.Contracts;
using Trading.WebApi.Data;
using Trading.WebApi.Services;

namespace Trading.WebApi.Workers;

public class AnalyticsConsumerWorker : BackgroundService
{
    private readonly LatestAnalyticsStore _store;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<AnalyticsConsumerWorker> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public AnalyticsConsumerWorker(
        LatestAnalyticsStore store,
        IServiceScopeFactory scopeFactory,
        IConfiguration config,
        ILogger<AnalyticsConsumerWorker> logger)
    {
        _store = store;
        _scopeFactory = scopeFactory;
        _config = config;
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        return Task.Run(() => RunConsumerAsync(stoppingToken), stoppingToken);
    }

    private async Task RunConsumerAsync(CancellationToken stoppingToken)
    {
        var bootstrap = _config["Kafka:BootstrapServers"] ?? "localhost:9092";
        var topic = _config["Kafka:AnalyticsTopic"] ?? "asset-analytics";
        var group = _config["Kafka:ConsumerGroup"] ?? "trading-webapi";

        _logger.LogInformation("AnalyticsConsumer connecting to {Bootstrap}, topic={Topic}, group={Group}", bootstrap, topic, group);

        var conf = new ConsumerConfig
        {
            BootstrapServers = bootstrap,
            GroupId = group,
            AutoOffsetReset = AutoOffsetReset.Latest,
        };

        using var consumer = new ConsumerBuilder<Ignore, string>(conf).Build();
        consumer.Subscribe(topic);
        _logger.LogInformation("AnalyticsConsumer subscribed to {Topic}", topic);
        var broadcastCount = 0;
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var result = consumer.Consume(TimeSpan.FromSeconds(1));
                    if (result?.Message?.Value == null) continue;
                    var json = result.Message.Value;
                    if (string.IsNullOrWhiteSpace(json)) continue;

                    AssetAnalytics? analytics;
                    try
                    {
                        analytics = JsonSerializer.Deserialize<AssetAnalytics>(json, JsonOptions);
                    }
                    catch
                    {
                        _logger.LogWarning("Invalid analytics JSON: {Json}", json);
                        continue;
                    }

                    if (analytics != null)
                    {
                        broadcastCount++;
                        if (broadcastCount <= 3 || broadcastCount % 100 == 0)
                            _logger.LogInformation("Analytics #{Count}: {Symbol} @ {LastPrice}", broadcastCount, analytics.Symbol, analytics.LastPrice);
                        _store.Set(analytics);

                        try
                        {
                            var ts = DateTime.UtcNow;
                            if (DateTime.TryParse(analytics.Timestamp, null, System.Globalization.DateTimeStyles.RoundtripKind, out var parsed))
                                ts = parsed.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(parsed, DateTimeKind.Utc) : parsed.ToUniversalTime();

                            using var scope = _scopeFactory.CreateScope();
                            var db = scope.ServiceProvider.GetRequiredService<TradingDbContext>();
                            db.AssetAnalytics.Add(new AssetAnalyticsEntity
                            {
                                Symbol = analytics.Symbol,
                                LastPrice = analytics.LastPrice,
                                MovingAverage5s = analytics.MovingAverage5s,
                                Volatility = analytics.Volatility,
                                Timestamp = ts
                            });
                            await db.SaveChangesAsync(stoppingToken);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to persist analytics for {Symbol}", analytics.Symbol);
                        }
                    }
                }
                catch (ConsumeException ex)
                {
                    _logger.LogWarning(ex, "Kafka consume error");
                }
            }
        }
        finally
        {
            consumer.Close();
        }
    }
}
