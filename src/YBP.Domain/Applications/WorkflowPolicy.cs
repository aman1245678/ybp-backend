using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Exceptions;

namespace YBP.Domain.Applications;

/// <summary>
/// The status-workflow rules shared by every application track. Encodes the ordered "happy path"
/// for each track (mirroring the frontend <c>FLOWS</c>) plus the branch to <c>Rejected</c> that is
/// reachable from any non-terminal status. This is the single source of legal status transitions.
/// </summary>
public static class WorkflowPolicy
{
    private static readonly IReadOnlyDictionary<WorkflowTrack, ApplicationStatus[]> Flows =
        new Dictionary<WorkflowTrack, ApplicationStatus[]>
        {
            [WorkflowTrack.Talent] =
            [
                ApplicationStatus.Submitted, ApplicationStatus.UnderReview, ApplicationStatus.ProfileEvaluated,
                ApplicationStatus.TalentPool, ApplicationStatus.AssignmentOffered
            ],
            [WorkflowTrack.Casting] =
            [
                ApplicationStatus.Submitted, ApplicationStatus.UnderReview, ApplicationStatus.AuditionRequested,
                ApplicationStatus.Shortlisted, ApplicationStatus.Selected
            ],
            [WorkflowTrack.Media] =
            [
                ApplicationStatus.Submitted, ApplicationStatus.UnderReview, ApplicationStatus.ProfileEvaluated,
                ApplicationStatus.Shortlisted, ApplicationStatus.AssignmentOffered
            ],
            [WorkflowTrack.Manpower] =
            [
                ApplicationStatus.Submitted, ApplicationStatus.UnderReview, ApplicationStatus.ProfileEvaluated,
                ApplicationStatus.InterviewScheduled, ApplicationStatus.Selected
            ],
        };

    /// <summary>Returns the ordered happy-path status sequence for a track.</summary>
    /// <param name="track">The workflow track.</param>
    public static IReadOnlyList<ApplicationStatus> Flow(WorkflowTrack track) => Flows[track];

    /// <summary>Returns true when a status cannot advance any further.</summary>
    /// <param name="status">The status to test.</param>
    public static bool IsTerminal(ApplicationStatus status)
        => status is ApplicationStatus.Selected or ApplicationStatus.Rejected;

    /// <summary>Returns the set of statuses that <paramref name="from"/> may legally transition to on a track.</summary>
    /// <param name="track">The workflow track.</param>
    /// <param name="from">The current status.</param>
    public static IReadOnlyCollection<ApplicationStatus> NextStatuses(WorkflowTrack track, ApplicationStatus from)
    {
        if (IsTerminal(from)) return [];

        var flow = Flows[track];
        var next = new List<ApplicationStatus>();

        var index = Array.IndexOf(flow, from);
        if (index >= 0 && index < flow.Length - 1)
            next.Add(flow[index + 1]);

        // Rejected is reachable from any non-terminal status.
        next.Add(ApplicationStatus.Rejected);
        return next;
    }

    /// <summary>Returns true when the transition is permitted.</summary>
    /// <param name="track">The workflow track.</param>
    /// <param name="from">The current status.</param>
    /// <param name="to">The desired status.</param>
    public static bool CanTransition(WorkflowTrack track, ApplicationStatus from, ApplicationStatus to)
        => NextStatuses(track, from).Contains(to);

    /// <summary>Throws when a transition is not permitted; otherwise returns.</summary>
    /// <param name="track">The workflow track.</param>
    /// <param name="from">The current status.</param>
    /// <param name="to">The desired status.</param>
    /// <exception cref="InvalidStatusTransitionException">Thrown when the transition is illegal.</exception>
    public static void EnsureCanTransition(WorkflowTrack track, ApplicationStatus from, ApplicationStatus to)
    {
        if (!CanTransition(track, from, to))
            throw new InvalidStatusTransitionException(
                $"Cannot transition a {track} application from {from} to {to}.");
    }
}
