using Confluent.Kafka;
using Trading.Aggregator;

var builder = Host.CreateApplicationBuilder(args);

var bootstrapServers = builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092";

var producerConfig = new ProducerConfig
{
    BootstrapServers = bootstrapServers,
    ClientId = "trading-aggregator"
};

builder.Services.AddSingleton<IProducer<string, string>>(_ =>
    new ProducerBuilder<string, string>(producerConfig).Build());

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
