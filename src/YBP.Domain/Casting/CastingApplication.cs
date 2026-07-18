using YBP.Domain.Applications;
using YBP.Domain.Casting.Events;
using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.ValueObjects;

namespace YBP.Domain.Casting;

/// <summary>
/// The record produced by the Casting Application System. An application aggregate on the
/// <see cref="WorkflowTrack.Casting"/> track; owns the applicant's physical profile.
/// </summary>
public sealed class CastingApplication : ApplicationAggregateRoot
{
    /// <inheritdoc />
    public override WorkflowTrack Track => WorkflowTrack.Casting;

    /// <summary>The applicant's name.</summary>
    public PersonName Name { get; private set; } = default!;

    /// <summary>The applicant's email.</summary>
    public EmailAddress Email { get; private set; } = default!;

    /// <summary>The applicant's mobile number.</summary>
    public MobileNumber Mobile { get; private set; } = default!;

    /// <summary>Date of birth, if provided (UTC date).</summary>
    public DateTime? DateOfBirth { get; private set; }

    /// <summary>Gender (optional).</summary>
    public Gender Gender { get; private set; } = Gender.Unspecified;

    /// <summary>The applicant's base location, if provided.</summary>
    public Location? Location { get; private set; }

    /// <summary>The applicant's physical profile (owned value object).</summary>
    public PhysicalProfile Physical { get; private set; } = PhysicalProfile.Empty;

    /// <summary>The experience-level slug.</summary>
    public string ExperienceLevel { get; private set; } = string.Empty;

    /// <summary>Years actively performing, if provided.</summary>
    public int? YearsActive { get; private set; }

    /// <summary>Notable projects/roles/credits (free text).</summary>
    public string? Credits { get; private set; }

    /// <summary>Languages the performer can act in.</summary>
    public TagList Languages { get; private set; } = TagList.Empty;

    /// <summary>Skills (dance, combat, accents, singing…).</summary>
    public TagList Skills { get; private set; } = TagList.Empty;

    /// <summary>Media links (reels, showreels).</summary>
    public TagList MediaLinks { get; private set; } = TagList.Empty;

    /// <summary>Availability preference slugs.</summary>
    public TagList Availability { get; private set; } = TagList.Empty;

    /// <summary>Whether the performer is willing to travel/relocate for shoots.</summary>
    public bool WillingToTravel { get; private set; }

    private CastingApplication(Guid id) : base(id) { }

    private CastingApplication() { } // ORM

    /// <summary>Creates and submits a casting application.</summary>
    /// <param name="name">The applicant's name.</param>
    /// <param name="email">The applicant's email.</param>
    /// <param name="mobile">The applicant's mobile number.</param>
    /// <param name="experienceLevel">The experience-level slug (required).</param>
    /// <param name="utcNow">The submission instant (UTC).</param>
    /// <param name="dateOfBirth">Date of birth (optional).</param>
    /// <param name="gender">Gender (optional).</param>
    /// <param name="location">Base location (optional).</param>
    /// <param name="physical">Physical profile (optional; defaults to empty).</param>
    /// <param name="yearsActive">Years active (optional).</param>
    /// <param name="credits">Credits text (optional).</param>
    /// <param name="languages">Languages (optional).</param>
    /// <param name="skills">Skills (optional).</param>
    /// <param name="mediaLinks">Media links (optional).</param>
    /// <param name="availability">Availability slugs (optional).</param>
    /// <param name="willingToTravel">Willing-to-travel flag.</param>
    /// <param name="emailVerification">Email OTP proof (optional).</param>
    /// <param name="mobileVerification">Mobile OTP proof (optional).</param>
    public static CastingApplication Create(
        PersonName name,
        EmailAddress email,
        MobileNumber mobile,
        string? experienceLevel,
        DateTime utcNow,
        DateTime? dateOfBirth = null,
        Gender gender = Gender.Unspecified,
        Location? location = null,
        PhysicalProfile? physical = null,
        int? yearsActive = null,
        string? credits = null,
        IEnumerable<string>? languages = null,
        IEnumerable<string>? skills = null,
        IEnumerable<string>? mediaLinks = null,
        IEnumerable<string>? availability = null,
        bool willingToTravel = false,
        VerificationToken? emailVerification = null,
        VerificationToken? mobileVerification = null)
    {
        if (yearsActive is < 0) throw new Common.Exceptions.DomainException("Years active cannot be negative.");

        var app = new CastingApplication(Guid.NewGuid())
        {
            Name = DomainGuard.NotNull(name),
            Email = DomainGuard.NotNull(email),
            Mobile = DomainGuard.NotNull(mobile),
            ExperienceLevel = DomainGuard.NotNullOrWhiteSpace(experienceLevel),
            DateOfBirth = dateOfBirth,
            Gender = gender,
            Location = location,
            Physical = physical ?? PhysicalProfile.Empty,
            YearsActive = yearsActive,
            Credits = DomainGuard.MaxLength(credits, 2000),
            Languages = TagList.Create(languages),
            Skills = TagList.Create(skills, maxTags: 25),
            MediaLinks = TagList.Create(mediaLinks),
            Availability = TagList.Create(availability),
            WillingToTravel = willingToTravel
        };

        app.SetVerification(emailVerification, mobileVerification);
        app.InitializeSubmission(utcNow);
        app.RaiseDomainEvent(new CastingApplicationSubmitted(app.Id, name.FullName, email.Value, mobile.Value)
        {
            OccurredOnUtc = utcNow
        });
        return app;
    }
}
