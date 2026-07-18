using YBP.Domain.Common.Base;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// A light-weight location/base city captured as free text across the applicant forms.
/// Always valid when present; absence is represented by a null reference on the owner.
/// </summary>
public sealed class Location : ValueObject
{
    /// <summary>The maximum accepted length.</summary>
    public const int MaxLength = 200;

    /// <summary>The city / base location text.</summary>
    public string City { get; private set; }

    private Location(string city) => City = city;

    private Location() => City = string.Empty; // ORM

    /// <summary>Creates a validated <see cref="Location"/>, or null when the input is blank.</summary>
    /// <param name="city">The city/base text (optional).</param>
    public static Location? Create(string? city)
    {
        if (string.IsNullOrWhiteSpace(city)) return null;
        return new Location(DomainGuard.MaxLength(city, MaxLength)!);
    }

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return City;
    }

    /// <inheritdoc />
    public override string ToString() => City;
}
