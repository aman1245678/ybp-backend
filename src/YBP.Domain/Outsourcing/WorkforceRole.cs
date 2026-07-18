using YBP.Domain.Common.Base;
using YBP.Domain.Common.ValueObjects;

namespace YBP.Domain.Outsourcing;

/// <summary>
/// A single role line-item within a workforce requirement (owned child entity of
/// <see cref="OutsourcingRequirement"/>). Contributes its <see cref="Count"/> to the parent's
/// total headcount.
/// </summary>
public sealed class WorkforceRole : Entity<Guid>
{
    /// <summary>The role title (e.g. "Video Editor", "Telecaller").</summary>
    public string Title { get; private set; } = string.Empty;

    /// <summary>The number of people required for this role (at least one).</summary>
    public int Count { get; private set; }

    /// <summary>The required skills for the role (free text).</summary>
    public TagList Skills { get; private set; } = TagList.Empty;

    /// <summary>The required experience level slug, if specified.</summary>
    public string? ExperienceLevel { get; private set; }

    private WorkforceRole(Guid id, string title, int count, TagList skills, string? experienceLevel)
        : base(id)
    {
        Title = title;
        Count = count;
        Skills = skills;
        ExperienceLevel = experienceLevel;
    }

    private WorkforceRole() { } // ORM

    /// <summary>Creates a validated workforce role.</summary>
    /// <param name="title">The role title (required).</param>
    /// <param name="count">The headcount for this role (at least one).</param>
    /// <param name="skills">The required skills (optional).</param>
    /// <param name="experienceLevel">The required experience level slug (optional).</param>
    public static WorkforceRole Create(string? title, int count, IEnumerable<string>? skills = null, string? experienceLevel = null)
    {
        var safeTitle = DomainGuard.NotNullOrWhiteSpace(title);
        DomainGuard.AtLeast(count, 1);
        return new WorkforceRole(Guid.NewGuid(), safeTitle, count, TagList.Create(skills), DomainGuard.MaxLength(experienceLevel, 100));
    }

    /// <summary>Changes the headcount for this role (at least one).</summary>
    /// <param name="count">The new headcount.</param>
    public void ChangeCount(int count) => Count = DomainGuard.AtLeast(count, 1);
}
