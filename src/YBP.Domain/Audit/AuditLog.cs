using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;

namespace YBP.Domain.Audit;

/// <summary>
/// An immutable, append-only record of an audited action (who did what, to which entity, when).
/// Created explicitly with its own timestamp; never updated or deleted.
/// </summary>
public sealed class AuditLog : AggregateRoot<Guid>
{
    /// <summary>The kind of action recorded.</summary>
    public AuditAction Action { get; private set; }

    /// <summary>The type of entity affected (e.g. "TalentProfile").</summary>
    public string EntityType { get; private set; } = string.Empty;

    /// <summary>The identifier of the entity affected, if applicable.</summary>
    public Guid? EntityId { get; private set; }

    /// <summary>The user who performed the action, if known.</summary>
    public Guid? PerformedByUserId { get; private set; }

    /// <summary>Optional structured detail about the action (e.g. a status change or JSON diff).</summary>
    public string? Detail { get; private set; }

    /// <summary>The UTC instant the action occurred.</summary>
    public DateTime OccurredAtUtc { get; private set; }

    private AuditLog(Guid id) : base(id) { }

    private AuditLog() { } // ORM

    /// <summary>Records an audit entry.</summary>
    /// <param name="action">The action kind.</param>
    /// <param name="entityType">The affected entity type (required).</param>
    /// <param name="utcNow">The instant the action occurred (UTC).</param>
    /// <param name="entityId">The affected entity id (optional).</param>
    /// <param name="performedByUserId">The acting user id (optional).</param>
    /// <param name="detail">Optional structured detail.</param>
    public static AuditLog Record(
        AuditAction action,
        string? entityType,
        DateTime utcNow,
        Guid? entityId = null,
        Guid? performedByUserId = null,
        string? detail = null)
        => new(Guid.NewGuid())
        {
            Action = action,
            EntityType = DomainGuard.NotNullOrWhiteSpace(entityType),
            EntityId = entityId,
            PerformedByUserId = performedByUserId,
            Detail = DomainGuard.MaxLength(detail, 4000),
            OccurredAtUtc = utcNow
        };
}
