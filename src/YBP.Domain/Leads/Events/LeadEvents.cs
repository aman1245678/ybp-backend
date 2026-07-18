using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Events;

namespace YBP.Domain.Leads.Events;

/// <summary>Raised whenever a lead is created (from any inquiry source). Drives notifications,
/// the CRM sync (future) and dashboard counters.</summary>
/// <param name="LeadId">The lead identifier.</param>
/// <param name="Type">The inquiry type.</param>
/// <param name="Source">The originating channel.</param>
public sealed record LeadCreated(Guid LeadId, InquiryType Type, LeadSource Source) : DomainEvent;

/// <summary>Raised for a direct inquiry (contact/collaboration/consultation) so lead-management
/// triage can react specifically to human-initiated inquiries.</summary>
/// <param name="LeadId">The lead identifier.</param>
/// <param name="Type">The inquiry type.</param>
/// <param name="Email">The contact email, if provided.</param>
/// <param name="Mobile">The contact mobile, if provided.</param>
public sealed record InquirySubmitted(Guid LeadId, InquiryType Type, string? Email, string? Mobile) : DomainEvent;
