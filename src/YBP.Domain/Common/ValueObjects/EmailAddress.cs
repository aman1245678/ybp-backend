using System.Text.RegularExpressions;
using YBP.Domain.Common.Base;
using YBP.Domain.Common.Exceptions;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// A validated, normalized email address. Stored lower-cased so equality and lookups are
/// case-insensitive. Mirrors the frontend <c>Validators.email</c> requirement.
/// </summary>
public sealed partial class EmailAddress : ValueObject
{
    /// <summary>The maximum accepted length.</summary>
    public const int MaxLength = 256;

    /// <summary>The normalized (lower-cased, trimmed) email value.</summary>
    public string Value { get; private set; }

    private EmailAddress(string value) => Value = value;

    private EmailAddress() => Value = string.Empty; // ORM

    /// <summary>Creates a validated <see cref="EmailAddress"/>.</summary>
    /// <param name="value">The raw email input.</param>
    /// <exception cref="DomainException">Thrown when the value is empty, too long, or malformed.</exception>
    public static EmailAddress Create(string? value)
    {
        var normalized = DomainGuard.NotNullOrWhiteSpace(value).ToLowerInvariant();
        if (normalized.Length > MaxLength)
            throw new DomainException($"Email must be {MaxLength} characters or fewer.");
        if (!EmailRegex().IsMatch(normalized))
            throw new DomainException("Email is not in a valid format.");
        return new EmailAddress(normalized);
    }

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    /// <inheritdoc />
    public override string ToString() => Value;

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.CultureInvariant)]
    private static partial Regex EmailRegex();
}
