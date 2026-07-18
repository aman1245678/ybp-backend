using YBP.Domain.Applications;
using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.ValueObjects;
using YBP.Domain.Media.Events;

namespace YBP.Domain.Media;

/// <summary>
/// The record produced by the Media Professional Registration system. An application aggregate on
/// the <see cref="WorkflowTrack.Media"/> track. Requires at least one skill.
/// </summary>
public sealed class MediaProfessional : ApplicationAggregateRoot
{
    /// <inheritdoc />
    public override WorkflowTrack Track => WorkflowTrack.Media;

    /// <summary>The applicant's name.</summary>
    public PersonName Name { get; private set; } = default!;

    /// <summary>The primary role/title (e.g. "Video Editor", "Motion Designer").</summary>
    public string Profession { get; private set; } = string.Empty;

    /// <summary>The applicant's email.</summary>
    public EmailAddress Email { get; private set; } = default!;

    /// <summary>The applicant's mobile number.</summary>
    public MobileNumber Mobile { get; private set; } = default!;

    /// <summary>The applicant's base location, if provided.</summary>
    public Location? Location { get; private set; }

    /// <summary>The experience-level slug.</summary>
    public string ExperienceLevel { get; private set; } = string.Empty;

    /// <summary>Professional skills (required — at least one).</summary>
    public TagList Skills { get; private set; } = TagList.Empty;

    /// <summary>Software-expertise tags.</summary>
    public TagList Software { get; private set; } = TagList.Empty;

    /// <summary>Portfolio links.</summary>
    public TagList PortfolioLinks { get; private set; } = TagList.Empty;

    /// <summary>Compensation expectation.</summary>
    public CompensationBand CompensationExpectation { get; private set; } = default!;

    /// <summary>Preferred engagement-model slug.</summary>
    public string EngagementModel { get; private set; } = string.Empty;

    /// <summary>Availability preference slugs.</summary>
    public TagList Availability { get; private set; } = TagList.Empty;

    /// <summary>The applicant's summary.</summary>
    public string? About { get; private set; }

    private MediaProfessional(Guid id) : base(id) { }

    private MediaProfessional() { } // ORM

    /// <summary>Creates and submits a media professional registration.</summary>
    /// <param name="name">The applicant's name.</param>
    /// <param name="profession">The primary profession/title (required).</param>
    /// <param name="email">The applicant's email.</param>
    /// <param name="mobile">The applicant's mobile number.</param>
    /// <param name="experienceLevel">The experience-level slug (required).</param>
    /// <param name="skills">Professional skills (required — at least one).</param>
    /// <param name="compensationExpectation">Compensation expectation.</param>
    /// <param name="engagementModel">Preferred engagement-model slug (required).</param>
    /// <param name="utcNow">The submission instant (UTC).</param>
    /// <param name="location">Base location (optional).</param>
    /// <param name="software">Software-expertise tags (optional).</param>
    /// <param name="portfolioLinks">Portfolio links (optional).</param>
    /// <param name="availability">Availability slugs (optional).</param>
    /// <param name="about">Summary (optional).</param>
    /// <param name="emailVerification">Email OTP proof (optional).</param>
    /// <param name="mobileVerification">Mobile OTP proof (optional).</param>
    public static MediaProfessional Create(
        PersonName name,
        string? profession,
        EmailAddress email,
        MobileNumber mobile,
        string? experienceLevel,
        IEnumerable<string>? skills,
        CompensationBand compensationExpectation,
        string? engagementModel,
        DateTime utcNow,
        Location? location = null,
        IEnumerable<string>? software = null,
        IEnumerable<string>? portfolioLinks = null,
        IEnumerable<string>? availability = null,
        string? about = null,
        VerificationToken? emailVerification = null,
        VerificationToken? mobileVerification = null)
    {
        var skillTags = TagList.Create(skills, maxTags: 25);
        DomainGuard.Requires(!skillTags.IsEmpty, "At least one skill is required.");

        var pro = new MediaProfessional(Guid.NewGuid())
        {
            Name = DomainGuard.NotNull(name),
            Profession = DomainGuard.NotNullOrWhiteSpace(profession),
            Email = DomainGuard.NotNull(email),
            Mobile = DomainGuard.NotNull(mobile),
            ExperienceLevel = DomainGuard.NotNullOrWhiteSpace(experienceLevel),
            Skills = skillTags,
            CompensationExpectation = DomainGuard.NotNull(compensationExpectation),
            EngagementModel = DomainGuard.NotNullOrWhiteSpace(engagementModel),
            Location = location,
            Software = TagList.Create(software),
            PortfolioLinks = TagList.Create(portfolioLinks),
            Availability = TagList.Create(availability),
            About = DomainGuard.MaxLength(about, 2000)
        };

        pro.SetVerification(emailVerification, mobileVerification);
        pro.InitializeSubmission(utcNow);
        pro.RaiseDomainEvent(new MediaProfessionalSubmitted(pro.Id, pro.Profession, name.FullName, email.Value, mobile.Value)
        {
            OccurredOnUtc = utcNow
        });
        return pro;
    }
}
