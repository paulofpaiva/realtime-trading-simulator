using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Trading.WebApi.Data;

namespace Trading.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SymbolsController : ControllerBase
{
    private readonly TradingDbContext _db;

    public SymbolsController(TradingDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SymbolDto>>> Get(CancellationToken ct)
    {
        var list = await _db.Symbols
            .OrderBy(s => s.Symbol)
            .Select(s => new SymbolDto(s.Symbol, s.DisplayName ?? s.Symbol))
            .ToListAsync(ct);
        return Ok(list);
    }
}

public record SymbolDto(string Symbol, string DisplayName);
