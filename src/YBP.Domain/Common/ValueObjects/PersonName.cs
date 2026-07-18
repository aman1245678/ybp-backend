using YBP.Domain.Common.Base;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// A person's name. Enforces the frontend rule of at least two characters. Supports both a
/// single full-name capture and composed first/last capture (e.g. the contact form).
/// </summary>
public sealed class PersonName : ValueObject
{
    /// <summary>The minimum length of a valid name.</summary>
    public const int MinLength = 2;

    /// <summary>The full display name.</summary>
    public string FullName { get; private set; }

    private PersonName(string fullName) => FullName = fullName;

    private PersonName() => FullName = string.Empty; // ORM

    /// <summary>Creates a <see cref="PersonName"/> from a single full-name string.</summary>
    /// <param name="fullName">The full name (min two characters).</param>
    public static PersonName Create(string? fullName)
    {
        var value = DomainGuard.NotNullOrWhiteSpace(fullName);
        DomainGuard.Requires(value.Length >= MinLength, $"Name must be at least {MinLength} characters.");
        return new PersonName(value);
    }

    /// <summary>Creates a <see cref="PersonName"/> from first and last name parts.</summary>
    /// <param name="firstName">The first name (min two characters).</param>
    /// <param name="lastName">The last name (min two characters).</param>
    public static PersonName Create(string? firstName, string? lastName)
    {
        var first = DomainGuard.NotNullOrWhiteSpace(firstName);
        var last = DomainGuard.NotNullOrWhiteSpace(lastName);
        DomainGuard.Requires(first.Length >= MinLength, $"First name must be at least {MinLength} characters.");
        DomainGuard.Requires(last.Length >= MinLength, $"Last name must be at least {MinLength} characters.");
        return new PersonName($"{first} {last}");
    }

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return FullName;
    }

    /// <inheritdoc />
    public override string ToString() => FullName;
}
