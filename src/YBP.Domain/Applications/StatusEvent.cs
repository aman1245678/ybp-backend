using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;

namespace YBP.Domain.Applications;

/// <summary>
/// An immutable, append-only record of a single application status transition. Owned by an
/// application aggregate's history; the basis for a future Applicant Tracking System timeline.
/// </summary>
public sealed class StatusEvent : Entity<Guid>
{
    /// <summary>The status the application moved into.</summary>
    public ApplicationStatus Status { get; private set; }

    /// <summary>The UTC instant the transition occurred.</summary>
    public DateTime AtUtc { get; private set; }

    /// <summary>An optional internal note attached to the transition.</summary>
    public string? Note { get; private set; }

    /// <summary>The admin user who performed the transition (null for system-generated events).</summary>
    public Guid? ByUserId { get; private set; }

    private StatusEvent(Guid id, ApplicationStatus status, DateTime atUtc, string? note, Guid? byUserId)
        : base(id)
    {
        Status = status;
        AtUtc = atUtc;
        Note = note;
        ByUserId = byUserId;
    }

    private StatusEvent() { } // ORM

    /// <summary>Creates a new status-history entry.</summary>
    /// <param name="status">The status entered.</param>
    /// <param name="atUtc">The UTC instant of the transition.</param>
    /// <param name="note">An optional note.</param>
    /// <param name="byUserId">The acting admin user, if any.</param>
    public static StatusEvent Create(ApplicationStatus status, DateTime atUtc, string? note = null, Guid? byUserId = null)
        => new(Guid.NewGuid(), status, atUtc, DomainGuard.MaxLength(note, 1000), byUserId);
}
