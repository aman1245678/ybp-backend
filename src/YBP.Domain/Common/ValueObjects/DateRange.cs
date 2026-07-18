using YBP.Domain.Common.Base;
using YBP.Domain.Common.Exceptions;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// An inclusive date range with an optional open end. Used for scheduled content windows
/// (showcase-of-the-week) and training schedules.
/// </summary>
public sealed class DateRange : ValueObject
{
    /// <summary>The start of the range (UTC).</summary>
    public DateTime StartUtc { get; private set; }

    /// <summary>The end of the range (UTC), or null for an open-ended range.</summary>
    public DateTime? EndUtc { get; private set; }

    private DateRange(DateTime startUtc, DateTime? endUtc)
    {
        StartUtc = startUtc;
        EndUtc = endUtc;
    }

    private DateRange() { } // ORM

    /// <summary>Creates a validated <see cref="DateRange"/>.</summary>
    /// <param name="startUtc">The start instant (UTC).</param>
    /// <param name="endUtc">The optional end instant (UTC); must not precede the start.</param>
    /// <exception cref="DomainException">Thrown when the end precedes the start.</exception>
    public static DateRange Create(DateTime startUtc, DateTime? endUtc = null)
    {
        if (endUtc is not null && endUtc < startUtc)
            throw new DomainException("The end of a date range cannot be before its start.");
        return new DateRange(startUtc, endUtc);
    }

    /// <summary>Returns true when <paramref name="instantUtc"/> falls within the range.</summary>
    /// <param name="instantUtc">The instant to test (UTC).</param>
    public bool Contains(DateTime instantUtc)
        => instantUtc >= StartUtc && (EndUtc is null || instantUtc <= EndUtc);

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return StartUtc;
        yield return EndUtc;
    }
}
