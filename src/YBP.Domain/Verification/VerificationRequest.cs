using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Exceptions;
using YBP.Domain.Verification.Events;

namespace YBP.Domain.Verification;

/// <summary>
/// A one-time-password verification request. Owns its security invariants: time-to-live, resend
/// cap, verify-attempt cap, single-use consumption and replay protection. The code itself is never
/// stored — only a hash supplied by the infrastructure layer.
/// </summary>
public sealed class VerificationRequest : AuditableAggregateRoot<Guid>
{
    /// <summary>The opaque server reference returned to the client and used to verify.</summary>
    public string VerificationId { get; private set; } = string.Empty;

    /// <summary>The channel over which the code was delivered.</summary>
    public OtpChannel Channel { get; private set; }

    /// <summary>A hash of the destination (email/mobile) — never the plain value.</summary>
    public string DestinationHash { get; private set; } = string.Empty;

    /// <summary>A hash of the issued code — never the plain code.</summary>
    public string CodeHash { get; private set; } = string.Empty;

    /// <summary>The business context in which the code was requested.</summary>
    public OtpPurpose Purpose { get; private set; }

    /// <summary>The UTC instant at which the code expires.</summary>
    public DateTime ExpiresAtUtc { get; private set; }

    /// <summary>The number of resends performed so far.</summary>
    public int ResendCount { get; private set; }

    /// <summary>The number of verify attempts performed so far.</summary>
    public int VerifyAttempts { get; private set; }

    /// <summary>True once the code has been successfully verified (single-use/replay protection).</summary>
    public bool Consumed { get; private set; }

    /// <summary>The maximum number of verify attempts allowed.</summary>
    public int MaxVerifyAttempts { get; private set; }

    /// <summary>The maximum number of resends allowed.</summary>
    public int MaxResendAttempts { get; private set; }

    private VerificationRequest(Guid id) : base(id) { }

    private VerificationRequest() { } // ORM

    /// <summary>Creates a new verification request and raises <see cref="OtpRequested"/>.</summary>
    /// <param name="verificationId">The opaque server reference (required).</param>
    /// <param name="channel">The delivery channel.</param>
    /// <param name="destinationHash">A hash of the destination (required).</param>
    /// <param name="codeHash">A hash of the issued code (required).</param>
    /// <param name="purpose">The business context.</param>
    /// <param name="utcNow">The creation instant (UTC).</param>
    /// <param name="ttlSeconds">The code time-to-live in seconds (positive).</param>
    /// <param name="maxVerifyAttempts">The maximum verify attempts (positive).</param>
    /// <param name="maxResendAttempts">The maximum resends (non-negative).</param>
    public static VerificationRequest Create(
        string? verificationId,
        OtpChannel channel,
        string? destinationHash,
        string? codeHash,
        OtpPurpose purpose,
        DateTime utcNow,
        int ttlSeconds,
        int maxVerifyAttempts,
        int maxResendAttempts)
    {
        DomainGuard.AtLeast(ttlSeconds, 1);
        DomainGuard.AtLeast(maxVerifyAttempts, 1);
        DomainGuard.Requires(maxResendAttempts >= 0, "Max resend attempts cannot be negative.");

        var request = new VerificationRequest(Guid.NewGuid())
        {
            VerificationId = DomainGuard.NotNullOrWhiteSpace(verificationId),
            Channel = channel,
            DestinationHash = DomainGuard.NotNullOrWhiteSpace(destinationHash),
            CodeHash = DomainGuard.NotNullOrWhiteSpace(codeHash),
            Purpose = purpose,
            ExpiresAtUtc = utcNow.AddSeconds(ttlSeconds),
            MaxVerifyAttempts = maxVerifyAttempts,
            MaxResendAttempts = maxResendAttempts
        };

        request.RaiseDomainEvent(new OtpRequested(request.Id, channel, purpose) { OccurredOnUtc = utcNow });
        return request;
    }

    /// <summary>Attempts to verify a supplied code hash, enforcing expiry, attempts and single-use.</summary>
    /// <param name="codeHashCandidate">The hash of the code the user submitted.</param>
    /// <param name="utcNow">The verification instant (UTC).</param>
    /// <returns>The outcome of the attempt.</returns>
    public VerificationOutcome Verify(string codeHashCandidate, DateTime utcNow)
    {
        if (Consumed) return VerificationOutcome.AlreadyConsumed;
        if (utcNow > ExpiresAtUtc) return VerificationOutcome.Expired;

        VerifyAttempts++;
        if (VerifyAttempts > MaxVerifyAttempts) return VerificationOutcome.TooManyAttempts;

        if (!string.Equals(codeHashCandidate, CodeHash, StringComparison.Ordinal))
            return VerificationOutcome.InvalidCode;

        Consumed = true;
        MarkUpdated(utcNow);
        RaiseDomainEvent(new OtpVerified(Id, Channel) { OccurredOnUtc = utcNow });
        return VerificationOutcome.Success;
    }

    /// <summary>Issues a fresh code (new hash + new expiry) as a resend, enforcing the resend cap.</summary>
    /// <param name="newCodeHash">The hash of the newly issued code.</param>
    /// <param name="utcNow">The resend instant (UTC).</param>
    /// <param name="ttlSeconds">The new time-to-live in seconds.</param>
    /// <exception cref="DomainException">Thrown when already consumed or the resend cap is exceeded.</exception>
    public void Resend(string? newCodeHash, DateTime utcNow, int ttlSeconds)
    {
        DomainGuard.Requires(!Consumed, "Cannot resend a code that has already been verified.");
        DomainGuard.Requires(ResendCount < MaxResendAttempts, "The maximum number of resends has been reached.");
        DomainGuard.AtLeast(ttlSeconds, 1);

        CodeHash = DomainGuard.NotNullOrWhiteSpace(newCodeHash);
        ExpiresAtUtc = utcNow.AddSeconds(ttlSeconds);
        ResendCount++;
        VerifyAttempts = 0;
        MarkUpdated(utcNow);
        RaiseDomainEvent(new OtpRequested(Id, Channel, Purpose) { OccurredOnUtc = utcNow });
    }

    /// <summary>Forces the request to expire immediately.</summary>
    /// <param name="utcNow">The expiry instant (UTC).</param>
    public void Expire(DateTime utcNow)
    {
        if (utcNow < ExpiresAtUtc) ExpiresAtUtc = utcNow;
        MarkUpdated(utcNow);
    }

    /// <summary>Returns true when the request has expired as of the supplied time.</summary>
    /// <param name="utcNow">The current instant (UTC).</param>
    public bool IsExpired(DateTime utcNow) => utcNow > ExpiresAtUtc;
}
