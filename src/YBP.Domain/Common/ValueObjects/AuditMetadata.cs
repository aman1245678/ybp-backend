using YBP.Domain.Common.Base;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// A value-object representation of audit stamps, available for read models and projections.
/// Note: persisted aggregates capture audit data via <see cref="AuditableAggregateRoot{TId}"/>
/// (populated by the persistence interceptor); this type is the composable equivalent.
/// </summary>
public sealed class AuditMetadata : ValueObject
{
    /// <summary>UTC instant the record was created.</summary>
    public DateTime CreatedAtUtc { get; private set; }

    /// <summary>Identifier of the creating actor (null for anonymous).</summary>
    public string? CreatedBy { get; private set; }

    /// <summary>UTC instant of the last update, if any.</summary>
    public DateTime? UpdatedAtUtc { get; private set; }

    /// <summary>Identifier of the last-updating actor, if any.</summary>
    public string? UpdatedBy { get; private set; }

    private AuditMetadata(DateTime createdAtUtc, string? createdBy, DateTime? updatedAtUtc, string? updatedBy)
    {
        CreatedAtUtc = createdAtUtc;
        CreatedBy = createdBy;
        UpdatedAtUtc = updatedAtUtc;
        UpdatedBy = updatedBy;
    }

    private AuditMetadata() { } // ORM

    /// <summary>Creates an <see cref="AuditMetadata"/> stamp for a newly created record.</summary>
    /// <param name="createdAtUtc">The creation instant (UTC).</param>
    /// <param name="createdBy">The creating actor (optional).</param>
    public static AuditMetadata ForCreation(DateTime createdAtUtc, string? createdBy = null)
        => new(createdAtUtc, createdBy, null, null);

    /// <summary>Returns a copy stamped with an update.</summary>
    /// <param name="updatedAtUtc">The update instant (UTC).</param>
    /// <param name="updatedBy">The updating actor (optional).</param>
    public AuditMetadata WithUpdate(DateTime updatedAtUtc, string? updatedBy = null)
        => new(CreatedAtUtc, CreatedBy, updatedAtUtc, updatedBy);

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return CreatedAtUtc;
        yield return CreatedBy;
        yield return UpdatedAtUtc;
        yield return UpdatedBy;
    }
}
