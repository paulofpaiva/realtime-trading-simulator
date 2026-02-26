using System.Text.Json;
using Confluent.Kafka;
using Microsoft.AspNetCore.SignalR;
using Trading.Contracts;
using Trading.WebApi.Hubs;

namespace Trading.WebApi.Workers;

public class AnalyticsConsumerWorker : BackgroundService
{
    private readonly IHubContext<TradingHub> _hub;
    private readonly IConfiguration _config;
    private readonly ILogger<AnalyticsConsumerWorker> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public AnalyticsConsumerWorker(
        IHubContext<TradingHub> hub,
        IConfiguration config,
        ILogger<AnalyticsConsumerWorker> logger)
    {
        _hub = hub;
        _config = config;
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Run Kafka consumption on a thread-pool thread so host startup is never blocked
        // (Subscribe/Consume can block when Kafka is unreachable)
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

        var messageCount = 0;
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

                    try
                    {
                        var _ = JsonSerializer.Deserialize<AssetAnalytics>(json, JsonOptions);
                    }
                    catch
                    {
                        _logger.LogWarning("Invalid analytics JSON: {Json}", json);
                        continue;
                    }

                    await _hub.Clients.All.SendAsync("ReceivePriceUpdate", json, stoppingToken);
                    messageCount++;
                    if (messageCount <= 3 || messageCount % 500 == 0)
                        _logger.LogInformation("SignalR broadcast #{Count}: {Json}", messageCount, json[..Math.Min(json.Length, 120)]);
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
