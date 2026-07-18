using System.Runtime.CompilerServices;
using YBP.Domain.Common.Exceptions;

namespace YBP.Domain.Common.Base;

/// <summary>
/// Guard clauses that enforce domain invariants by throwing <see cref="DomainException"/>
/// (rather than <see cref="ArgumentException"/>) so callers can treat all rule violations
/// uniformly. Used by value-object factories and entity methods.
/// </summary>
public static class DomainGuard
{
    /// <summary>Ensures a string is non-null and non-whitespace; returns the trimmed value.</summary>
    /// <param name="value">The value to validate.</param>
    /// <param name="field">The logical field name for the error message.</param>
    public static string NotNullOrWhiteSpace(string? value, [CallerArgumentExpression(nameof(value))] string? field = null)
        => string.IsNullOrWhiteSpace(value)
            ? throw new DomainException($"{field} is required.")
            : value.Trim();

    /// <summary>Ensures a reference is non-null; returns it.</summary>
    /// <param name="value">The value to validate.</param>
    /// <param name="field">The logical field name for the error message.</param>
    public static T NotNull<T>(T? value, [CallerArgumentExpression(nameof(value))] string? field = null) where T : class
        => value ?? throw new DomainException($"{field} is required.");

    /// <summary>Ensures a condition holds, otherwise throws with the supplied message.</summary>
    /// <param name="condition">The condition that must be true.</param>
    /// <param name="message">The error message when the condition is false.</param>
    public static void Requires(bool condition, string message)
    {
        if (!condition) throw new DomainException(message);
    }

    /// <summary>Ensures an integer is greater than or equal to a minimum.</summary>
    /// <param name="value">The value to validate.</param>
    /// <param name="min">The inclusive minimum.</param>
    /// <param name="field">The logical field name for the error message.</param>
    public static int AtLeast(int value, int min, [CallerArgumentExpression(nameof(value))] string? field = null)
        => value < min
            ? throw new DomainException($"{field} must be at least {min}.")
            : value;

    /// <summary>Ensures a string does not exceed a maximum length; returns the trimmed value.</summary>
    /// <param name="value">The value to validate (may be null).</param>
    /// <param name="maxLength">The maximum allowed length.</param>
    /// <param name="field">The logical field name for the error message.</param>
    public static string? MaxLength(string? value, int maxLength, [CallerArgumentExpression(nameof(value))] string? field = null)
    {
        var trimmed = value?.Trim();
        if (trimmed is not null && trimmed.Length > maxLength)
            throw new DomainException($"{field} must be {maxLength} characters or fewer.");
        return trimmed;
    }
}
