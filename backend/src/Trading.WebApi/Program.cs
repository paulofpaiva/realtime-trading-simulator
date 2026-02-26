using Microsoft.AspNetCore.SignalR;
using Trading.WebApi.Hubs;
using Trading.WebApi.Workers;

Console.WriteLine("WebApi: starting...");
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://127.0.0.1:5001");

builder.Services.AddOpenApi();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? new[] { "http://localhost:5173", "http://127.0.0.1:5173" };
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddHostedService<AnalyticsConsumerWorker>();

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHttpsRedirection();
}

app.UseRouting();
app.MapHub<TradingHub>("/tradingHub");

app.MapGet("/test-signal", async (IHubContext<Trading.WebApi.Hubs.TradingHub> hub) =>
{
    var testJson = """{"symbol":"BTC","lastPrice":50000.0,"movingAverage5s":49999.0,"volatility":0.1234,"timestamp":"2026-02-26T00:00:00Z"}""";
    await hub.Clients.All.SendAsync("ReceivePriceUpdate", testJson);
    return Results.Ok(new { sent = testJson });
});

app.Lifetime.ApplicationStarted.Register(() =>
{
    Console.WriteLine("WebApi: ready at http://localhost:5001/tradingHub (frontend: http://localhost:5173)");
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("WebApi started. Connect frontend to http://localhost:5001/tradingHub");
});

app.Run();
