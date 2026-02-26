namespace Trading.WebApi.Data;

public class SymbolEntity
{
    public int Id { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
}
