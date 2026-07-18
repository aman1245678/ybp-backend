using YBP.Domain.Applications.Events;
using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.ValueObjects;

namespace YBP.Domain.Applications;

/// <summary>
/// Shared base for the four application aggregates (talent, casting, media, manpower). Encapsulates
/// the status field, the append-only history and the guarded <see cref="AdvanceStatus"/> transition
/// so the workflow logic lives in exactly one place (no duplication across tracks).
/// </summary>
public abstract class ApplicationAggregateRoot : AuditableAggregateRoot<Guid>
{
    private readonly List<StatusEvent> _history = [];

    /// <summary>The current application status.</summary>
    public ApplicationStatus Status { get; private set; }

    /// <summary>The append-only status history, oldest first.</summary>
    public IReadOnlyCollection<StatusEvent> History => _history.AsReadOnly();

    /// <summary>Proof that the applicant's email was verified via OTP (null until supplied).</summary>
    public VerificationToken? EmailVerification { get; private set; }

    /// <summary>Proof that the applicant's mobile was verified via OTP (null until supplied).</summary>
    public VerificationToken? MobileVerification { get; private set; }

    /// <summary>The workflow track this aggregate belongs to.</summary>
    public abstract WorkflowTrack Track { get; }

    /// <summary>Creates an application aggregate with the supplied identifier.</summary>
    /// <param name="id">The unique identifier.</param>
    protected ApplicationAggregateRoot(Guid id) : base(id) { }

    /// <summary>Parameterless constructor reserved for ORM materialization.</summary>
    protected ApplicationAggregateRoot() { }

    /// <summary>Seeds the initial <see cref="ApplicationStatus.Submitted"/> status and history entry.
    /// Called by derived factory methods immediately after construction.</summary>
    /// <param name="utcNow">The submission instant (UTC).</param>
    protected void InitializeSubmission(DateTime utcNow)
    {
        Status = ApplicationStatus.Submitted;
        _history.Add(StatusEvent.Create(ApplicationStatus.Submitted, utcNow, $"Created via {Track} portal"));
    }

    /// <summary>Attaches the OTP verification proofs supplied at submission time.</summary>
    /// <param name="email">Email verification token (optional).</param>
    /// <param name="mobile">Mobile verification token (optional).</param>
    protected void SetVerification(VerificationToken? email, VerificationToken? mobile)
    {
        EmailVerification = email;
        MobileVerification = mobile;
    }

    /// <summary>Advances the application to a new status, enforcing the track's workflow rules.</summary>
    /// <param name="next">The desired status.</param>
    /// <param name="utcNow">The transition instant (UTC).</param>
    /// <param name="byUserId">The acting admin user, if any.</param>
    /// <param name="note">An optional note recorded on the transition.</param>
    /// <exception cref="Common.Exceptions.InvalidStatusTransitionException">Thrown when the transition is illegal.</exception>
    public void AdvanceStatus(ApplicationStatus next, DateTime utcNow, Guid? byUserId = null, string? note = null)
    {
        WorkflowPolicy.EnsureCanTransition(Track, Status, next);

        var from = Status;
        Status = next;
        _history.Add(StatusEvent.Create(next, utcNow, note, byUserId));
        MarkUpdated(utcNow, byUserId?.ToString());

        RaiseDomainEvent(new ApplicationStatusAdvanced(Id, Track, from, next, byUserId) { OccurredOnUtc = utcNow });
    }
}
