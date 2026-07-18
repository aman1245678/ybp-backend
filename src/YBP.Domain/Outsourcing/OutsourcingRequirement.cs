using YBP.Domain.Applications;
using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.ValueObjects;
using YBP.Domain.Outsourcing.Events;

namespace YBP.Domain.Outsourcing;

/// <summary>
/// The record produced by the Manpower Requirement Portal (6-step wizard). An application aggregate
/// on the <see cref="WorkflowTrack.Manpower"/> track. Owns its <see cref="WorkforceRole"/> collection
/// and enforces the invariant that <see cref="TotalHeadcount"/> equals the sum of role counts.
/// </summary>
public sealed class OutsourcingRequirement : ApplicationAggregateRoot
{
    private readonly List<WorkforceRole> _roles = [];

    /// <inheritdoc />
    public override WorkflowTrack Track => WorkflowTrack.Manpower;

    /// <summary>The requesting organization's name.</summary>
    public string OrganizationName { get; private set; } = string.Empty;

    /// <summary>The industry slug.</summary>
    public string Industry { get; private set; } = string.Empty;

    /// <summary>The primary contact person.</summary>
    public string ContactPerson { get; private set; } = string.Empty;

    /// <summary>The contact email.</summary>
    public EmailAddress Email { get; private set; } = default!;

    /// <summary>The contact mobile number.</summary>
    public MobileNumber Mobile { get; private set; } = default!;

    /// <summary>The organization's website, if provided.</summary>
    public string? Website { get; private set; }

    /// <summary>Approximate company size.</summary>
    public CompanySize CompanySize { get; private set; } = CompanySize.Unspecified;

    /// <summary>The role line-items (owned; at least one).</summary>
    public IReadOnlyCollection<WorkforceRole> Roles => _roles.AsReadOnly();

    /// <summary>The total headcount across all roles (kept in sync with the roles).</summary>
    public int TotalHeadcount { get; private set; }

    /// <summary>Deployment location, if provided.</summary>
    public Location? Location { get; private set; }

    /// <summary>Deployment work mode (optional).</summary>
    public WorkMode? WorkMode { get; private set; }

    /// <summary>The date the workforce is needed by, if provided (UTC).</summary>
    public DateTime? StartDate { get; private set; }

    /// <summary>Engagement duration text (e.g. "3 months", "Permanent").</summary>
    public string? Duration { get; private set; }

    /// <summary>The budget range.</summary>
    public CompensationBand BudgetRange { get; private set; } = default!;

    /// <summary>Additional compensation notes.</summary>
    public string? CompensationNotes { get; private set; }

    /// <summary>Free-text description of the requirement.</summary>
    public string? Requirement { get; private set; }

    private OutsourcingRequirement(Guid id) : base(id) { }

    private OutsourcingRequirement() { } // ORM

    /// <summary>Creates and submits a workforce requirement with an initial set of roles (at least one).</summary>
    /// <param name="organizationName">The organization name (required).</param>
    /// <param name="industry">The industry slug (required).</param>
    /// <param name="contactPerson">The contact person (required).</param>
    /// <param name="email">The contact email.</param>
    /// <param name="mobile">The contact mobile number.</param>
    /// <param name="budgetRange">The budget range.</param>
    /// <param name="roles">The initial workforce roles (at least one).</param>
    /// <param name="utcNow">The submission instant (UTC).</param>
    /// <param name="website">The organization website (optional).</param>
    /// <param name="companySize">Company size (optional).</param>
    /// <param name="location">Deployment location (optional).</param>
    /// <param name="workMode">Deployment work mode (optional).</param>
    /// <param name="startDate">Start date (optional).</param>
    /// <param name="duration">Duration text (optional).</param>
    /// <param name="compensationNotes">Compensation notes (optional).</param>
    /// <param name="requirement">Free-text requirement (optional).</param>
    /// <param name="emailVerification">Email OTP proof (optional).</param>
    /// <param name="mobileVerification">Mobile OTP proof (optional).</param>
    public static OutsourcingRequirement Create(
        string? organizationName,
        string? industry,
        string? contactPerson,
        EmailAddress email,
        MobileNumber mobile,
        CompensationBand budgetRange,
        IEnumerable<WorkforceRole> roles,
        DateTime utcNow,
        string? website = null,
        CompanySize companySize = CompanySize.Unspecified,
        Location? location = null,
        WorkMode? workMode = null,
        DateTime? startDate = null,
        string? duration = null,
        string? compensationNotes = null,
        string? requirement = null,
        VerificationToken? emailVerification = null,
        VerificationToken? mobileVerification = null)
    {
        var roleList = (roles ?? []).ToList();
        DomainGuard.Requires(roleList.Count >= 1, "At least one workforce role is required.");

        var req = new OutsourcingRequirement(Guid.NewGuid())
        {
            OrganizationName = DomainGuard.NotNullOrWhiteSpace(organizationName),
            Industry = DomainGuard.NotNullOrWhiteSpace(industry),
            ContactPerson = DomainGuard.NotNullOrWhiteSpace(contactPerson),
            Email = DomainGuard.NotNull(email),
            Mobile = DomainGuard.NotNull(mobile),
            BudgetRange = DomainGuard.NotNull(budgetRange),
            Website = DomainGuard.MaxLength(website, 500),
            CompanySize = companySize,
            Location = location,
            WorkMode = workMode,
            StartDate = startDate,
            Duration = DomainGuard.MaxLength(duration, 200),
            CompensationNotes = DomainGuard.MaxLength(compensationNotes, 2000),
            Requirement = DomainGuard.MaxLength(requirement, 2000)
        };

        req._roles.AddRange(roleList);
        req.RecalculateTotalHeadcount();
        req.SetVerification(emailVerification, mobileVerification);
        req.InitializeSubmission(utcNow);
        req.RaiseDomainEvent(new OutsourcingRequirementSubmitted(
            req.Id, req.OrganizationName, req.ContactPerson, email.Value, mobile.Value, req.TotalHeadcount)
        {
            OccurredOnUtc = utcNow
        });
        return req;
    }

    /// <summary>Adds a workforce role and recalculates the total headcount.</summary>
    /// <param name="role">The role to add.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void AddRole(WorkforceRole role, DateTime utcNow)
    {
        _roles.Add(DomainGuard.NotNull(role));
        RecalculateTotalHeadcount();
        MarkUpdated(utcNow);
    }

    /// <summary>Removes a workforce role (at least one role must remain) and recalculates the total.</summary>
    /// <param name="roleId">The role identifier to remove.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    /// <exception cref="Common.Exceptions.DomainException">Thrown when removing the last remaining role.</exception>
    public void RemoveRole(Guid roleId, DateTime utcNow)
    {
        DomainGuard.Requires(_roles.Count > 1, "At least one workforce role is required.");
        var role = _roles.FirstOrDefault(r => r.Id == roleId);
        if (role is null) return;
        _roles.Remove(role);
        RecalculateTotalHeadcount();
        MarkUpdated(utcNow);
    }

    /// <summary>Recomputes <see cref="TotalHeadcount"/> as the sum of all role counts.</summary>
    public void RecalculateTotalHeadcount() => TotalHeadcount = _roles.Sum(r => r.Count);
}
