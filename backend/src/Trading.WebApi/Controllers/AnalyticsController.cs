using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Trading.WebApi.Data;

namespace Trading.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly TradingDbContext _db;

    public AnalyticsController(TradingDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Get historical analytics for a symbol.
    /// </summary>
    /// <param name="symbol">Symbol (e.g. BTC, ETH)</param>
    /// <param name="from">Start date (ISO 8601)</param>
    /// <param name="to">End date (ISO 8601)</param>
    /// <param name="limit">Max rows (default 500, max 5000)</param>
    [HttpGet("{symbol}")]
    public async Task<ActionResult<IReadOnlyList<AnalyticsDto>>> GetHistory(
        string symbol,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int limit = 500,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(symbol))
            return BadRequest();

        var maxLimit = Math.Clamp(limit, 1, 5000);
        var query = _db.AssetAnalytics.Where(a => a.Symbol == symbol);

        if (from.HasValue)
            query = query.Where(a => a.Timestamp >= from.Value);
        if (to.HasValue)
            query = query.Where(a => a.Timestamp <= to.Value);

        var list = await query
            .OrderByDescending(a => a.Timestamp)
            .Take(maxLimit)
            .Select(a => new AnalyticsDto(
                a.Symbol,
                a.LastPrice,
                a.MovingAverage5s,
                a.Volatility,
                a.Timestamp))
            .ToListAsync(ct);

        list.Reverse();
        return Ok(list);
    }
}

public record AnalyticsDto(
    string Symbol,
    double LastPrice,
    double MovingAverage5s,
    double Volatility,
    DateTime Timestamp);
