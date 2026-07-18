using System.Text.RegularExpressions;
using YBP.Domain.Common.Base;
using YBP.Domain.Common.Exceptions;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// A validated Indian mobile number, normalized to its bare 10-digit form (leading 6–9).
/// Encapsulates the frontend <c>indianMobileValidator</c> and <c>normalizeIndianMobile</c> rules
/// so the same logic lives in exactly one place.
/// </summary>
public sealed partial class MobileNumber : ValueObject
{
    /// <summary>The normalized bare 10-digit national number.</summary>
    public string Value { get; private set; }

    private MobileNumber(string value) => Value = value;

    private MobileNumber() => Value = string.Empty; // ORM

    /// <summary>Creates a validated <see cref="MobileNumber"/> from arbitrary input.</summary>
    /// <param name="value">The raw mobile input (may include +91/91/0 prefixes, spaces or dashes).</param>
    /// <exception cref="DomainException">Thrown when the value cannot be normalized to a valid 10-digit number.</exception>
    public static MobileNumber Create(string? value)
    {
        var raw = DomainGuard.NotNullOrWhiteSpace(value);
        var normalized = Normalize(raw)
            ?? throw new DomainException("Mobile number is not a valid Indian mobile number.");
        return new MobileNumber(normalized);
    }

    /// <summary>
    /// Reduces an input to its bare 10-digit national form, or returns null when it is not a
    /// valid Indian mobile number. Handles 12-digit (91…) and 11-digit (0…) prefixes.
    /// </summary>
    /// <param name="value">The raw input.</param>
    public static string? Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var digits = DigitsOnly().Replace(value, string.Empty);

        if (digits.Length == 10 && IsLeadingSix(digits)) return digits;
        if (digits.Length == 12 && digits.StartsWith("91", StringComparison.Ordinal))
        {
            var rest = digits[2..];
            return IsLeadingSix(rest) ? rest : null;
        }
        if (digits.Length == 11 && digits.StartsWith('0'))
        {
            var rest = digits[1..];
            return IsLeadingSix(rest) ? rest : null;
        }
        return null;
    }

    private static bool IsLeadingSix(string tenDigits) => tenDigits.Length == 10 && tenDigits[0] is >= '6' and <= '9';

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    /// <inheritdoc />
    public override string ToString() => Value;

    [GeneratedRegex(@"\D", RegexOptions.CultureInvariant)]
    private static partial Regex DigitsOnly();
}
