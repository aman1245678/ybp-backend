using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Events;

namespace YBP.Domain.Identity.Events;

/// <summary>Raised when a public signup registration request is captured (credentials issued out-of-band).</summary>
/// <param name="RegistrationRequestId">The registration request identifier.</param>
/// <param name="Email">The applicant's email.</param>
/// <param name="Category">The signup category.</param>
public sealed record RegistrationRequested(Guid RegistrationRequestId, string Email, SignupCategory Category) : DomainEvent;

/// <summary>Raised when a user account is created.</summary>
/// <param name="UserId">The user identifier.</param>
/// <param name="Email">The user's email.</param>
public sealed record UserRegistered(Guid UserId, string Email) : DomainEvent;

/// <summary>Raised when credentials are issued for an approved registration request.</summary>
/// <param name="UserId">The created user identifier.</param>
/// <param name="RegistrationRequestId">The originating registration request.</param>
public sealed record CredentialsIssued(Guid UserId, Guid RegistrationRequestId) : DomainEvent;

/// <summary>Raised when a user requests a password reset.</summary>
/// <param name="UserId">The user identifier.</param>
/// <param name="Email">The user's email.</param>
public sealed record PasswordResetRequested(Guid UserId, string Email) : DomainEvent;
