using YBP.Domain.Applications;
using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.ValueObjects;
using YBP.Domain.Talent.Events;

namespace YBP.Domain.Talent;

/// <summary>
/// The record produced by the Talent &amp; Career Portal ("Join Our Network"). An application
/// aggregate on the <see cref="WorkflowTrack.Talent"/> track; the foundation of a future Talent
/// Management System.
/// </summary>
public sealed class TalentProfile : ApplicationAggregateRoot
{
    /// <inheritdoc />
    public override WorkflowTrack Track => WorkflowTrack.Talent;

    /// <summary>The chosen talent category slug (one of the 12 categories).</summary>
    public string Category { get; private set; } = string.Empty;

    /// <summary>The applicant's name.</summary>
    public PersonName Name { get; private set; } = default!;

    /// <summary>The applicant's email.</summary>
    public EmailAddress Email { get; private set; } = default!;

    /// <summary>The applicant's mobile number.</summary>
    public MobileNumber Mobile { get; private set; } = default!;

    /// <summary>The applicant's base location, if provided.</summary>
    public Location? Location { get; private set; }

    /// <summary>The experience-level slug.</summary>
    public string ExperienceLevel { get; private set; } = string.Empty;

    /// <summary>Free-text skill tags.</summary>
    public TagList Skills { get; private set; } = TagList.Empty;

    /// <summary>Availability preference slugs.</summary>
    public TagList Availability { get; private set; } = TagList.Empty;

    /// <summary>Portfolio / social links.</summary>
    public TagList PortfolioLinks { get; private set; } = TagList.Empty;

    /// <summary>The applicant's own summary.</summary>
    public string? About { get; private set; }

    private TalentProfile(Guid id) : base(id) { }

    private TalentProfile() { } // ORM

    /// <summary>Creates and submits a talent profile.</summary>
    /// <param name="category">The talent category slug (required).</param>
    /// <param name="name">The applicant's name.</param>
    /// <param name="email">The applicant's email.</param>
    /// <param name="mobile">The applicant's mobile number.</param>
    /// <param name="experienceLevel">The experience-level slug (required).</param>
    /// <param name="utcNow">The submission instant (UTC).</param>
    /// <param name="location">The base location (optional).</param>
    /// <param name="skills">Free-text skills (optional).</param>
    /// <param name="availability">Availability slugs (optional).</param>
    /// <param name="portfolioLinks">Portfolio/social links (optional).</param>
    /// <param name="about">The applicant's summary (optional).</param>
    /// <param name="emailVerification">Email OTP proof (optional).</param>
    /// <param name="mobileVerification">Mobile OTP proof (optional).</param>
    public static TalentProfile Create(
        string? category,
        PersonName name,
        EmailAddress email,
        MobileNumber mobile,
        string? experienceLevel,
        DateTime utcNow,
        Location? location = null,
        IEnumerable<string>? skills = null,
        IEnumerable<string>? availability = null,
        IEnumerable<string>? portfolioLinks = null,
        string? about = null,
        VerificationToken? emailVerification = null,
        VerificationToken? mobileVerification = null)
    {
        var profile = new TalentProfile(Guid.NewGuid())
        {
            Category = DomainGuard.NotNullOrWhiteSpace(category),
            Name = DomainGuard.NotNull(name),
            Email = DomainGuard.NotNull(email),
            Mobile = DomainGuard.NotNull(mobile),
            ExperienceLevel = DomainGuard.NotNullOrWhiteSpace(experienceLevel),
            Location = location,
            Skills = TagList.Create(skills, maxTags: 25),
            Availability = TagList.Create(availability),
            PortfolioLinks = TagList.Create(portfolioLinks),
            About = DomainGuard.MaxLength(about, 2000)
        };

        profile.SetVerification(emailVerification, mobileVerification);
        profile.InitializeSubmission(utcNow);
        profile.RaiseDomainEvent(new TalentProfileSubmitted(profile.Id, profile.Category, name.FullName, email.Value, mobile.Value)
        {
            OccurredOnUtc = utcNow
        });
        return profile;
    }
}
