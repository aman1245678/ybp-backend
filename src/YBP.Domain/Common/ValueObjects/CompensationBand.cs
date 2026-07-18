using YBP.Domain.Common.Base;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// A compensation/budget expectation expressed as a taxonomy slug (e.g. "25k-50k", "negotiable")
/// with an optional human label. Free-text friendly — the slug is not constrained to the lookup
/// table so custom values captured by the frontend are preserved.
/// </summary>
public sealed class CompensationBand : ValueObject
{
    /// <summary>The band slug (or free-text value).</summary>
    public string Slug { get; private set; }

    /// <summary>An optional resolved label for display.</summary>
    public string? Label { get; private set; }

    private CompensationBand(string slug, string? label)
    {
        Slug = slug;
        Label = label;
    }

    private CompensationBand() => Slug = string.Empty; // ORM

    /// <summary>Creates a validated <see cref="CompensationBand"/>.</summary>
    /// <param name="slug">The band slug or free-text value (required).</param>
    /// <param name="label">Optional display label.</param>
    public static CompensationBand Create(string? slug, string? label = null)
        => new(DomainGuard.NotNullOrWhiteSpace(slug), DomainGuard.MaxLength(label, 200));

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Slug;
        yield return Label;
    }

    /// <inheritdoc />
    public override string ToString() => Label ?? Slug;
}
