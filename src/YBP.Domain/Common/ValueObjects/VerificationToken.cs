using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// A signed proof that a contact channel (email or mobile) was verified via OTP. Submitted
/// alongside an application so the backend can confirm verification server-side (defends against
/// client tampering — Blueprint §18).
/// </summary>
public sealed class VerificationToken : ValueObject
{
    /// <summary>The opaque signed token value.</summary>
    public string Value { get; private set; }

    /// <summary>The channel the token proves.</summary>
    public OtpChannel Channel { get; private set; }

    /// <summary>The UTC instant the token was issued.</summary>
    public DateTime IssuedAtUtc { get; private set; }

    private VerificationToken(string value, OtpChannel channel, DateTime issuedAtUtc)
    {
        Value = value;
        Channel = channel;
        IssuedAtUtc = issuedAtUtc;
    }

    private VerificationToken() => Value = string.Empty; // ORM

    /// <summary>Creates a validated <see cref="VerificationToken"/>.</summary>
    /// <param name="value">The signed token value (required).</param>
    /// <param name="channel">The channel the token proves.</param>
    /// <param name="issuedAtUtc">When the token was issued (UTC).</param>
    public static VerificationToken Create(string? value, OtpChannel channel, DateTime issuedAtUtc)
        => new(DomainGuard.NotNullOrWhiteSpace(value), channel, issuedAtUtc);

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
        yield return Channel;
        yield return IssuedAtUtc;
    }
}
