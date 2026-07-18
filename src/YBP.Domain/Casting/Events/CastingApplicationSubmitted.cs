using YBP.Domain.Common.Events;

namespace YBP.Domain.Casting.Events;

/// <summary>Raised when a casting application is submitted.</summary>
/// <param name="CastingApplicationId">The aggregate identifier.</param>
/// <param name="FullName">The applicant's full name.</param>
/// <param name="Email">The applicant's email.</param>
/// <param name="Mobile">The applicant's normalized mobile number.</param>
public sealed record CastingApplicationSubmitted(
    Guid CastingApplicationId,
    string FullName,
    string Email,
    string Mobile) : DomainEvent;
