using System.Text.Json;
using Confluent.Kafka;
using Microsoft.AspNetCore.SignalR;
using Trading.Contracts;

namespace Trading.WebApi;

public class AnalyticsConsumerWorker : BackgroundService
{
    private readonly ILogger<AnalyticsConsumerWorker> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHubContext<TradingHub> _hubContext;

    public AnalyticsConsumerWorker(
        ILogger<AnalyticsConsumerWorker> logger,
        IConfiguration configuration,
        IHubContext<TradingHub> hubContext)
    {
        _logger = logger;
        _configuration = configuration;
        _hubContext = hubContext;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        return Task.Run(() => RunConsumeLoop(stoppingToken), stoppingToken);
    }

    private void RunConsumeLoop(CancellationToken stoppingToken)
    {
        var bootstrapServers = _configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
        var analyticsTopic = _configuration["Kafka:AssetAnalyticsTopic"] ?? "asset-analytics";
        var consumerGroup = _configuration["Kafka:ConsumerGroup"] ?? "trading-webapi";

        var config = new ConsumerConfig
        {
            BootstrapServers = bootstrapServers,
            GroupId = consumerGroup,
            AutoOffsetReset = AutoOffsetReset.Latest,
            EnableAutoCommit = true
        };

        using var consumer = new ConsumerBuilder<string, string>(config).Build();
        consumer.Subscribe(analyticsTopic);

        _logger.LogInformation("WebApi analytics consumer started. Topic: {Topic}", analyticsTopic);

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var cr = consumer.Consume(TimeSpan.FromSeconds(5));
                    if (cr == null)
                    {
                        continue;
                    }

                    var value = cr.Message.Value;
                    if (string.IsNullOrWhiteSpace(value))
                    {
                        continue;
                    }

                    AssetAnalytics? analytics = null;
                    try
                    {
                        analytics = JsonSerializer.Deserialize<AssetAnalytics>(value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to deserialize AssetAnalytics payload.");
                    }

                    _logger.LogDebug("Received analytics message for key {Key}: {Payload}", cr.Message.Key, value);

                    _hubContext.Clients.All.SendAsync("ReceivePriceUpdate", value, cancellationToken: stoppingToken)
                        .GetAwaiter()
                        .GetResult();

                    if (analytics != null)
                    {
                        _logger.LogInformation(
                            "Broadcasted analytics for {Symbol}: last={LastPrice}, ma5={MovingAverage5s}, vol={Volatility}",
                            analytics.Symbol,
                            analytics.LastPrice,
                            analytics.MovingAverage5s,
                            analytics.Volatility);
                    }
                }
                catch (ConsumeException ex)
                {
                    _logger.LogWarning(ex, "Consume error: {Reason}", ex.Error.Reason);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    // graceful shutdown
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error while consuming analytics messages.");
                }
            }
        }
        finally
        {
            consumer.Close();
            _logger.LogInformation("WebApi analytics consumer stopping.");
        }
    }
}
