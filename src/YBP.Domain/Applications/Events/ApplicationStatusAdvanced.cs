using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Events;

namespace YBP.Domain.Applications.Events;

/// <summary>
/// Raised when an application's status is advanced by an admin action. Consumed by audit,
/// applicant-update notifications and dashboard counters.
/// </summary>
/// <param name="ApplicationId">The application aggregate identifier.</param>
/// <param name="Track">The workflow track.</param>
/// <param name="FromStatus">The prior status.</param>
/// <param name="ToStatus">The new status.</param>
/// <param name="ByUserId">The acting admin user, if any.</param>
public sealed record ApplicationStatusAdvanced(
    Guid ApplicationId,
    WorkflowTrack Track,
    ApplicationStatus FromStatus,
    ApplicationStatus ToStatus,
    Guid? ByUserId) : DomainEvent;
