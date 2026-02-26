using Confluent.Kafka;
using Trading.PriceGenerator;

var builder = Host.CreateApplicationBuilder(args);

var kafkaConfig = new ProducerConfig
{
    BootstrapServers = builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092",
    ClientId = "trading-price-generator"
};

builder.Services.AddSingleton<IProducer<string, string>>(_ =>
    new ProducerBuilder<string, string>(kafkaConfig).Build());

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
