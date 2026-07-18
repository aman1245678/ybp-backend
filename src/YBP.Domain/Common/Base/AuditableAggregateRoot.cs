namespace YBP.Domain.Common.Base;

/// <summary>
/// Convenience base for the common case of an aggregate root that is auditable,
/// soft-deletable and concurrency-protected. Audit fields are written by the persistence
/// interceptor; soft-delete transitions are exposed as explicit domain operations.
/// </summary>
/// <typeparam name="TId">The identifier type.</typeparam>
public abstract class AuditableAggregateRoot<TId> : AggregateRoot<TId>, IAuditable, ISoftDeletable, IHasRowVersion
    where TId : notnull
{
    /// <inheritdoc />
    public DateTime CreatedAtUtc { get; private set; }

    /// <inheritdoc />
    public string? CreatedBy { get; private set; }

    /// <inheritdoc />
    public DateTime? UpdatedAtUtc { get; private set; }

    /// <inheritdoc />
    public string? UpdatedBy { get; private set; }

    /// <inheritdoc />
    public bool IsDeleted { get; private set; }

    /// <inheritdoc />
    public DateTime? DeletedAtUtc { get; private set; }

    /// <inheritdoc />
    public string? DeletedBy { get; private set; }

    /// <inheritdoc />
    public byte[] RowVersion { get; private set; } = [];

    /// <summary>Creates an auditable aggregate root with the supplied identifier.</summary>
    /// <param name="id">The unique identifier.</param>
    protected AuditableAggregateRoot(TId id) : base(id) { }

    /// <summary>Parameterless constructor reserved for ORM materialization.</summary>
    protected AuditableAggregateRoot() { }

    /// <summary>Advances the in-domain "last modified" marker. Call from mutating domain methods
    /// so the change is visible before the persistence interceptor runs.</summary>
    /// <param name="utcNow">The current UTC time supplied by the caller.</param>
    /// <param name="by">Optional identifier of the actor performing the change.</param>
    protected void MarkUpdated(DateTime utcNow, string? by = null)
    {
        UpdatedAtUtc = utcNow;
        UpdatedBy = by;
    }

    /// <summary>Soft-deletes the aggregate (idempotent).</summary>
    /// <param name="utcNow">The current UTC time.</param>
    /// <param name="by">Optional identifier of the actor performing the deletion.</param>
    public void MarkDeleted(DateTime utcNow, string? by = null)
    {
        if (IsDeleted) return;
        IsDeleted = true;
        DeletedAtUtc = utcNow;
        DeletedBy = by;
    }

    /// <summary>Restores a previously soft-deleted aggregate (idempotent).</summary>
    public void Restore()
    {
        if (!IsDeleted) return;
        IsDeleted = false;
        DeletedAtUtc = null;
        DeletedBy = null;
    }
}
