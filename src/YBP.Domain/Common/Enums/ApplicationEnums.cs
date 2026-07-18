namespace YBP.Domain.Common.Enums;

/// <summary>
/// The canonical application-lifecycle vocabulary shared by every applicant-facing track.
/// Mirrors the frontend <c>ApplicationStatus</c> union; a given track uses a subset (see
/// <see cref="WorkflowTrack"/> and the workflow policy).
/// </summary>
public enum ApplicationStatus
{
    /// <summary>Received and queued for review.</summary>
    Submitted = 0,

    /// <summary>Being reviewed by the team.</summary>
    UnderReview = 1,

    /// <summary>Portfolio/experience assessed against current briefs.</summary>
    ProfileEvaluated = 2,

    /// <summary>Shortlisted for an upcoming opportunity.</summary>
    Shortlisted = 3,

    /// <summary>An interview/discussion has been scheduled.</summary>
    InterviewScheduled = 4,

    /// <summary>Invited to an audition or callback.</summary>
    AuditionRequested = 5,

    /// <summary>Selected for the project (terminal, positive).</summary>
    Selected = 6,

    /// <summary>Added to the curated talent pool for future matching.</summary>
    TalentPool = 7,

    /// <summary>A specific assignment/engagement has been offered.</summary>
    AssignmentOffered = 8,

    /// <summary>Did not progress further (terminal, negative).</summary>
    Rejected = 9
}

/// <summary>The four applicant/requirement workflow tracks.</summary>
public enum WorkflowTrack
{
    /// <summary>Talent &amp; Career Portal registrations.</summary>
    Talent = 0,

    /// <summary>Casting Application System submissions.</summary>
    Casting = 1,

    /// <summary>Media Professional registrations.</summary>
    Media = 2,

    /// <summary>Manpower / workforce requirement intake.</summary>
    Manpower = 3
}
