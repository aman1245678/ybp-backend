namespace YBP.Domain.Common.Base;

/// <summary>Marker interface identifying an aggregate root — the only entry point
/// through which the members of an aggregate may be modified and the unit of a
/// single transaction.</summary>
public interface IAggregateRoot;

/// <summary>Audit stamps captured for an entity. Setters are intentionally absent —
/// values are populated by the persistence layer's audit interceptor, never by callers.</summary>
public interface IAuditable
{
    /// <summary>UTC instant the record was first persisted.</summary>
    DateTime CreatedAtUtc { get; }

    /// <summary>Identifier of the actor that created the record (null for anonymous public submissions).</summary>
    string? CreatedBy { get; }

    /// <summary>UTC instant of the most recent modification, if any.</summary>
    DateTime? UpdatedAtUtc { get; }

    /// <summary>Identifier of the actor that last modified the record.</summary>
    string? UpdatedBy { get; }
}

/// <summary>An entity that is soft-deleted (flagged) rather than physically removed.</summary>
public interface ISoftDeletable
{
    /// <summary>True when the record has been soft-deleted and hidden from normal queries.</summary>
    bool IsDeleted { get; }

    /// <summary>UTC instant the record was soft-deleted.</summary>
    DateTime? DeletedAtUtc { get; }

    /// <summary>Identifier of the actor that soft-deleted the record.</summary>
    string? DeletedBy { get; }
}

/// <summary>An entity carrying an optimistic-concurrency token.</summary>
public interface IHasRowVersion
{
    /// <summary>Opaque concurrency token maintained by the database (<c>rowversion</c>).</summary>
    byte[] RowVersion { get; }
}

/// <summary>Reference/CMS data that can be enabled or retired without deletion.</summary>
public interface IActivatable
{
    /// <summary>True when the record is currently active/published.</summary>
    bool IsActive { get; }
}
