using Trading.WebApi.Hubs;
using Trading.WebApi.Workers;

Console.WriteLine("WebApi: starting...");
var builder = WebApplication.CreateBuilder(args);

// Force IPv4 only so Kestrel doesn't hang on IPv6 resolution (macOS)
builder.WebHost.UseUrls("http://127.0.0.1:5000");

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

// CORS first so preflight OPTIONS always gets Access-Control-Allow-Origin
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

app.Lifetime.ApplicationStarted.Register(() =>
{
    Console.WriteLine("WebApi: ready at http://localhost:5000/tradingHub (frontend: http://localhost:5173)");
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("WebApi started. Connect frontend to http://localhost:5000/tradingHub");
});

app.Run();
