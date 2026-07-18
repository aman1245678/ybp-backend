using YBP.Domain.Common.Base;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// A bundle of external links captured across forms: portfolio/social links, media links and a
/// single Instagram handle. Each part is optional; the value object is always valid.
/// </summary>
public sealed class SocialLinks : ValueObject
{
    /// <summary>Portfolio / general links (reels, behance, drive, etc.).</summary>
    public TagList PortfolioLinks { get; private set; }

    /// <summary>Media links (showreels, video URLs).</summary>
    public TagList MediaLinks { get; private set; }

    /// <summary>An optional Instagram handle or URL.</summary>
    public string? Instagram { get; private set; }

    private SocialLinks(TagList portfolioLinks, TagList mediaLinks, string? instagram)
    {
        PortfolioLinks = portfolioLinks;
        MediaLinks = mediaLinks;
        Instagram = instagram;
    }

    private SocialLinks() // ORM
    {
        PortfolioLinks = TagList.Empty;
        MediaLinks = TagList.Empty;
    }

    /// <summary>An empty set of links.</summary>
    public static SocialLinks Empty => new(TagList.Empty, TagList.Empty, null);

    /// <summary>Creates a <see cref="SocialLinks"/> bundle.</summary>
    /// <param name="portfolioLinks">Portfolio/general links (optional).</param>
    /// <param name="mediaLinks">Media links (optional).</param>
    /// <param name="instagram">Instagram handle/URL (optional).</param>
    public static SocialLinks Create(
        IEnumerable<string>? portfolioLinks = null,
        IEnumerable<string>? mediaLinks = null,
        string? instagram = null)
        => new(TagList.Create(portfolioLinks), TagList.Create(mediaLinks), DomainGuard.MaxLength(instagram, 256));

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return PortfolioLinks;
        yield return MediaLinks;
        yield return Instagram;
    }
}
