using YBP.Domain.Common.Events;

namespace YBP.Domain.Outsourcing.Events;

/// <summary>Raised when a workforce/outsourcing requirement is submitted.</summary>
/// <param name="OutsourcingRequirementId">The aggregate identifier.</param>
/// <param name="OrganizationName">The requesting organization's name.</param>
/// <param name="ContactPerson">The primary contact person.</param>
/// <param name="Email">The contact email.</param>
/// <param name="Mobile">The contact's normalized mobile number.</param>
/// <param name="TotalHeadcount">The total headcount requested across all roles.</param>
public sealed record OutsourcingRequirementSubmitted(
    Guid OutsourcingRequirementId,
    string OrganizationName,
    string ContactPerson,
    string Email,
    string Mobile,
    int TotalHeadcount) : DomainEvent;
