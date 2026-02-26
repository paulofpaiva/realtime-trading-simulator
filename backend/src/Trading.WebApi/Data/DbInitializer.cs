using Microsoft.EntityFrameworkCore;

namespace Trading.WebApi.Data;

public static class DbInitializer
{
    public static void EnsureSymbolsTable(TradingDbContext db)
    {
        db.Database.ExecuteSqlRaw("""
            CREATE TABLE IF NOT EXISTS symbols (
                "Id" SERIAL PRIMARY KEY,
                "Symbol" VARCHAR(32) NOT NULL UNIQUE,
                "DisplayName" VARCHAR(128)
            );
            """);

        db.Database.ExecuteSqlRaw("""
            INSERT INTO symbols ("Symbol", "DisplayName") VALUES
                ('BTC', 'Bitcoin'),
                ('ETH', 'Ethereum'),
                ('AAPL', 'Apple Inc'),
                ('TSLA', 'Tesla')
            ON CONFLICT ("Symbol") DO NOTHING;
            """);
    }
}
