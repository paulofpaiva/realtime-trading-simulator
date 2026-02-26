using Confluent.Kafka;
using Microsoft.AspNetCore.SignalR;
using Trading.Contracts;
using Trading.WebApi;

var builder = WebApplication.CreateBuilder(args);

// SignalR
builder.Services.AddSignalR();

// CORS for frontend
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
                     new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Kafka consumer hosted service
builder.Services.AddHostedService<AnalyticsConsumerWorker>();

var app = builder.Build();

app.UseRouting();
app.UseCors();

app.MapHub<TradingHub>("/tradingHub");

app.Run();
