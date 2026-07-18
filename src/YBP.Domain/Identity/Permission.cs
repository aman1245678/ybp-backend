using YBP.Domain.Common.Base;

namespace YBP.Domain.Identity;

/// <summary>
/// A fine-grained capability (e.g. "applications.advance-status", "cms.edit") that can be granted
/// to roles. Modelled as its own aggregate so the permission catalogue can evolve independently.
/// </summary>
public sealed class Permission : AuditableAggregateRoot<Guid>
{
    /// <summary>The stable permission code (unique).</summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>A human-readable description.</summary>
    public string? Description { get; private set; }

    private Permission(Guid id) : base(id) { }

    private Permission() { } // ORM

    /// <summary>Creates a permission definition.</summary>
    /// <param name="code">The stable permission code (required).</param>
    /// <param name="description">An optional description.</param>
    public static Permission Create(string? code, string? description = null)
        => new(Guid.NewGuid())
        {
            Code = DomainGuard.NotNullOrWhiteSpace(code),
            Description = DomainGuard.MaxLength(description, 500)
        };

    /// <summary>Updates the permission description.</summary>
    /// <param name="description">The new description.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void UpdateDescription(string? description, DateTime utcNow)
    {
        Description = DomainGuard.MaxLength(description, 500);
        MarkUpdated(utcNow);
    }
}
