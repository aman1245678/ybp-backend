using YBP.Domain.Common.Base;

namespace YBP.Domain.Identity;

/// <summary>
/// A rotating refresh token owned by a <see cref="User"/>. Supports revocation and reuse-detection
/// chaining (via <see cref="ReplacedByToken"/>).
/// </summary>
public sealed class RefreshToken : Entity<Guid>
{
    /// <summary>The opaque token value.</summary>
    public string Token { get; private set; } = string.Empty;

    /// <summary>The UTC instant the token expires.</summary>
    public DateTime ExpiresAtUtc { get; private set; }

    /// <summary>The UTC instant the token was created.</summary>
    public DateTime CreatedAtUtc { get; private set; }

    /// <summary>The UTC instant the token was revoked, if any.</summary>
    public DateTime? RevokedAtUtc { get; private set; }

    /// <summary>The token that replaced this one on rotation, if any.</summary>
    public string? ReplacedByToken { get; private set; }

    private RefreshToken(Guid id, string token, DateTime expiresAtUtc, DateTime createdAtUtc)
        : base(id)
    {
        Token = token;
        ExpiresAtUtc = expiresAtUtc;
        CreatedAtUtc = createdAtUtc;
    }

    private RefreshToken() { } // ORM

    /// <summary>Issues a new refresh token.</summary>
    /// <param name="token">The opaque token value (required).</param>
    /// <param name="createdAtUtc">The creation instant (UTC).</param>
    /// <param name="expiresAtUtc">The expiry instant (UTC); must be after creation.</param>
    public static RefreshToken Issue(string? token, DateTime createdAtUtc, DateTime expiresAtUtc)
    {
        var value = DomainGuard.NotNullOrWhiteSpace(token);
        DomainGuard.Requires(expiresAtUtc > createdAtUtc, "A refresh token must expire after it is created.");
        return new RefreshToken(Guid.NewGuid(), value, expiresAtUtc, createdAtUtc);
    }

    /// <summary>True when the token is neither expired nor revoked at the supplied time.</summary>
    /// <param name="utcNow">The current instant (UTC).</param>
    public bool IsActive(DateTime utcNow) => RevokedAtUtc is null && utcNow <= ExpiresAtUtc;

    /// <summary>Revokes the token, optionally recording its replacement (idempotent).</summary>
    /// <param name="utcNow">The revocation instant (UTC).</param>
    /// <param name="replacedByToken">The replacing token value, if rotated.</param>
    public void Revoke(DateTime utcNow, string? replacedByToken = null)
    {
        if (RevokedAtUtc is not null) return;
        RevokedAtUtc = utcNow;
        ReplacedByToken = replacedByToken;
    }
}
