using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;

namespace YBP.Domain.Identity;

/// <summary>
/// A security role aligned to a <see cref="RoleType"/>. Groups a set of permission codes (claims)
/// that are granted to its members. The basis for the future portal role model.
/// </summary>
public sealed class Role : AuditableAggregateRoot<Guid>
{
    private readonly HashSet<string> _permissionCodes = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>The coarse role type.</summary>
    public RoleType Type { get; private set; }

    /// <summary>The display name of the role.</summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>The permission codes granted to this role.</summary>
    public IReadOnlyCollection<string> PermissionCodes => _permissionCodes.ToList().AsReadOnly();

    private Role(Guid id) : base(id) { }

    private Role() { } // ORM

    /// <summary>Creates a role.</summary>
    /// <param name="type">The role type.</param>
    /// <param name="name">The display name (required).</param>
    public static Role Create(RoleType type, string? name)
        => new(Guid.NewGuid())
        {
            Type = type,
            Name = DomainGuard.NotNullOrWhiteSpace(name)
        };

    /// <summary>Grants a permission code to the role (idempotent).</summary>
    /// <param name="permissionCode">The permission code to grant.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void GrantPermission(string? permissionCode, DateTime utcNow)
    {
        if (_permissionCodes.Add(DomainGuard.NotNullOrWhiteSpace(permissionCode)))
            MarkUpdated(utcNow);
    }

    /// <summary>Revokes a permission code from the role (idempotent).</summary>
    /// <param name="permissionCode">The permission code to revoke.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void RevokePermission(string? permissionCode, DateTime utcNow)
    {
        if (permissionCode is not null && _permissionCodes.Remove(permissionCode))
            MarkUpdated(utcNow);
    }

    /// <summary>Returns true when the role holds the given permission.</summary>
    /// <param name="permissionCode">The permission code to test.</param>
    public bool HasPermission(string permissionCode) => _permissionCodes.Contains(permissionCode);
}
