using YBP.Domain.Common.Events;

namespace YBP.Domain.Media.Events;

/// <summary>Raised when a media professional registration is submitted.</summary>
/// <param name="MediaProfessionalId">The aggregate identifier.</param>
/// <param name="Profession">The primary profession/title.</param>
/// <param name="FullName">The applicant's full name.</param>
/// <param name="Email">The applicant's email.</param>
/// <param name="Mobile">The applicant's normalized mobile number.</param>
public sealed record MediaProfessionalSubmitted(
    Guid MediaProfessionalId,
    string Profession,
    string FullName,
    string Email,
    string Mobile) : DomainEvent;
