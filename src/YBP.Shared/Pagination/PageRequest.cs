namespace YBP.Shared.Pagination;

/// <summary>
/// Normalized paging/sorting input for admin list endpoints. Clamps values to safe
/// bounds so an abusive page size can never trigger an unbounded query (§14).
/// </summary>
public sealed record PageRequest
{
    public const int MaxPageSize = 100;
    public const int DefaultPageSize = 20;

    private readonly int _page = 1;
    private readonly int _pageSize = DefaultPageSize;

    public int Page
    {
        get => _page;
        init => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        init => _pageSize = value switch
        {
            < 1 => DefaultPageSize,
            > MaxPageSize => MaxPageSize,
            _ => value
        };
    }

    /// <summary>Optional allow-listed sort field (validated per-endpoint).</summary>
    public string? SortBy { get; init; }

    public bool SortDescending { get; init; }

    /// <summary>Optional free-text search term.</summary>
    public string? Search { get; init; }

    public int Skip => (Page - 1) * PageSize;
}
