using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Events;

namespace YBP.Domain.Verification.Events;

/// <summary>Raised when an OTP is requested (initial request or resend). Drives delivery + metrics.</summary>
/// <param name="VerificationRequestId">The verification request identifier.</param>
/// <param name="Channel">The delivery channel.</param>
/// <param name="Purpose">The business context of the request.</param>
public sealed record OtpRequested(Guid VerificationRequestId, OtpChannel Channel, OtpPurpose Purpose) : DomainEvent;

/// <summary>Raised when an OTP is successfully verified.</summary>
/// <param name="VerificationRequestId">The verification request identifier.</param>
/// <param name="Channel">The verified channel.</param>
public sealed record OtpVerified(Guid VerificationRequestId, OtpChannel Channel) : DomainEvent;
