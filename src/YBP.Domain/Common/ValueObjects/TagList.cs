using YBP.Domain.Common.Base;
using YBP.Domain.Common.Exceptions;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// An immutable, de-duplicated, ordered list of free-text tags (skills, software, languages,
/// availability, links). Case-insensitive de-duplication preserving first occurrence, mirroring
/// the frontend skill-tags control. Free text by design — not constrained to any taxonomy.
/// </summary>
public sealed class TagList : ValueObject
{
    /// <summary>The default maximum number of tags (defensive cap; the UI limit is 25).</summary>
    public const int DefaultMaxTags = 50;

    private readonly List<string> _values;

    /// <summary>The tags, in insertion order with duplicates removed.</summary>
    public IReadOnlyList<string> Values => _values.AsReadOnly();

    /// <summary>True when there are no tags.</summary>
    public bool IsEmpty => _values.Count == 0;

    private TagList(List<string> values) => _values = values;

    private TagList() => _values = []; // ORM

    /// <summary>An empty tag list.</summary>
    public static TagList Empty => new([]);

    /// <summary>Creates a <see cref="TagList"/> from raw items, trimming, dropping blanks and de-duplicating.</summary>
    /// <param name="items">The raw tag values (null yields an empty list).</param>
    /// <param name="maxTags">The maximum number of tags permitted.</param>
    /// <exception cref="DomainException">Thrown when the number of distinct tags exceeds <paramref name="maxTags"/>.</exception>
    public static TagList Create(IEnumerable<string>? items, int maxTags = DefaultMaxTags)
    {
        var result = new List<string>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var raw in items ?? [])
        {
            var trimmed = raw?.Trim();
            if (string.IsNullOrEmpty(trimmed)) continue;
            if (seen.Add(trimmed))
                result.Add(trimmed);
        }

        if (result.Count > maxTags)
            throw new DomainException($"A maximum of {maxTags} tags is allowed.");

        return new TagList(result);
    }

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents() => _values.Cast<object?>();
}
