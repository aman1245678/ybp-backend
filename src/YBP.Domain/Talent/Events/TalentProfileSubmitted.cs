using YBP.Domain.Common.Events;

namespace YBP.Domain.Talent.Events;

/// <summary>Raised when a talent profile is submitted. The Application layer reacts by creating a
/// linked lead and firing notifications.</summary>
/// <param name="TalentProfileId">The aggregate identifier.</param>
/// <param name="Category">The talent category slug.</param>
/// <param name="FullName">The applicant's full name.</param>
/// <param name="Email">The applicant's email.</param>
/// <param name="Mobile">The applicant's normalized mobile number.</param>
public sealed record TalentProfileSubmitted(
    Guid TalentProfileId,
    string Category,
    string FullName,
    string Email,
    string Mobile) : DomainEvent;
