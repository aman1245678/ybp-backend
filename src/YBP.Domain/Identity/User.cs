using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.ValueObjects;
using YBP.Domain.Identity.Events;

namespace YBP.Domain.Identity;

/// <summary>
/// The platform user domain model (identity concerns such as password hashing live in the
/// infrastructure/ASP.NET Identity layer). Owns its role assignments and refresh tokens and
/// exposes explicit lifecycle operations.
/// </summary>
public sealed class User : AuditableAggregateRoot<Guid>
{
    private readonly HashSet<RoleType> _roles = [];
    private readonly List<RefreshToken> _refreshTokens = [];

    /// <summary>The user's name.</summary>
    public PersonName Name { get; private set; } = default!;

    /// <summary>The user's email.</summary>
    public EmailAddress Email { get; private set; } = default!;

    /// <summary>The user's mobile number, if provided.</summary>
    public MobileNumber? Mobile { get; private set; }

    /// <summary>The account status.</summary>
    public UserStatus Status { get; private set; }

    /// <summary>Whether the user's email has been verified.</summary>
    public bool IsEmailVerified { get; private set; }

    /// <summary>Whether the user's mobile has been verified.</summary>
    public bool IsMobileVerified { get; private set; }

    /// <summary>The roles assigned to the user.</summary>
    public IReadOnlyCollection<RoleType> Roles => _roles.ToList().AsReadOnly();

    /// <summary>The refresh tokens issued to the user.</summary>
    public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

    private User(Guid id) : base(id) { }

    private User() { } // ORM

    /// <summary>Registers a new user account and raises <see cref="UserRegistered"/>.</summary>
    /// <param name="name">The user's name.</param>
    /// <param name="email">The user's email.</param>
    /// <param name="utcNow">The creation instant (UTC).</param>
    /// <param name="mobile">The user's mobile (optional).</param>
    /// <param name="status">The initial status (defaults to Invited).</param>
    public static User Register(
        PersonName name,
        EmailAddress email,
        DateTime utcNow,
        MobileNumber? mobile = null,
        UserStatus status = UserStatus.Invited)
    {
        var user = new User(Guid.NewGuid())
        {
            Name = DomainGuard.NotNull(name),
            Email = DomainGuard.NotNull(email),
            Mobile = mobile,
            Status = status
        };
        user.RaiseDomainEvent(new UserRegistered(user.Id, email.Value) { OccurredOnUtc = utcNow });
        return user;
    }

    /// <summary>Assigns a role to the user (idempotent).</summary>
    /// <param name="role">The role to assign.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void AssignRole(RoleType role, DateTime utcNow)
    {
        if (_roles.Add(role)) MarkUpdated(utcNow);
    }

    /// <summary>Removes a role from the user (idempotent).</summary>
    /// <param name="role">The role to remove.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void RemoveRole(RoleType role, DateTime utcNow)
    {
        if (_roles.Remove(role)) MarkUpdated(utcNow);
    }

    /// <summary>Returns true when the user holds the given role.</summary>
    /// <param name="role">The role to test.</param>
    public bool IsInRole(RoleType role) => _roles.Contains(role);

    /// <summary>Activates the account.</summary>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void Activate(DateTime utcNow)
    {
        Status = UserStatus.Active;
        MarkUpdated(utcNow);
    }

    /// <summary>Deactivates the account.</summary>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void Deactivate(DateTime utcNow)
    {
        Status = UserStatus.Deactivated;
        MarkUpdated(utcNow);
    }

    /// <summary>Suspends the account temporarily.</summary>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void Suspend(DateTime utcNow)
    {
        Status = UserStatus.Suspended;
        MarkUpdated(utcNow);
    }

    /// <summary>Marks the user's email as verified.</summary>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void MarkEmailVerified(DateTime utcNow)
    {
        IsEmailVerified = true;
        MarkUpdated(utcNow);
    }

    /// <summary>Marks the user's mobile as verified.</summary>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void MarkMobileVerified(DateTime utcNow)
    {
        IsMobileVerified = true;
        MarkUpdated(utcNow);
    }

    /// <summary>Adds a refresh token to the user.</summary>
    /// <param name="token">The refresh token to add.</param>
    public void AddRefreshToken(RefreshToken token) => _refreshTokens.Add(DomainGuard.NotNull(token));

    /// <summary>Revokes a refresh token by value (if present), optionally recording its replacement.</summary>
    /// <param name="token">The token value to revoke.</param>
    /// <param name="utcNow">The revocation instant (UTC).</param>
    /// <param name="replacedByToken">The replacing token value, if rotated.</param>
    public void RevokeRefreshToken(string token, DateTime utcNow, string? replacedByToken = null)
        => _refreshTokens.FirstOrDefault(t => t.Token == token)?.Revoke(utcNow, replacedByToken);

    /// <summary>Raises a password-reset request event.</summary>
    /// <param name="utcNow">The request instant (UTC).</param>
    public void RequestPasswordReset(DateTime utcNow)
        => RaiseDomainEvent(new PasswordResetRequested(Id, Email.Value) { OccurredOnUtc = utcNow });
}
