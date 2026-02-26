using Microsoft.EntityFrameworkCore;

namespace Trading.WebApi.Data;

public class TradingDbContext : DbContext
{
    public TradingDbContext(DbContextOptions<TradingDbContext> options)
        : base(options)
    {
    }

    public DbSet<AssetAnalyticsEntity> AssetAnalytics => Set<AssetAnalyticsEntity>();
    public DbSet<SymbolEntity> Symbols => Set<SymbolEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AssetAnalyticsEntity>(e =>
        {
            e.ToTable("asset_analytics");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).UseIdentityByDefaultColumn();
            e.Property(x => x.Symbol).HasMaxLength(32).IsRequired();
            e.Property(x => x.LastPrice).IsRequired();
            e.Property(x => x.MovingAverage5s).IsRequired();
            e.Property(x => x.Volatility).IsRequired();
            e.Property(x => x.Timestamp).IsRequired();
            e.HasIndex(x => new { x.Symbol, x.Timestamp });
        });

        modelBuilder.Entity<SymbolEntity>(e =>
        {
            e.ToTable("symbols");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).UseIdentityByDefaultColumn();
            e.Property(x => x.Symbol).HasMaxLength(32).IsRequired();
            e.Property(x => x.DisplayName).HasMaxLength(128);
            e.HasIndex(x => x.Symbol).IsUnique();
        });
    }
}
