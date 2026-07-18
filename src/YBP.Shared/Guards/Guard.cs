using System.Runtime.CompilerServices;

namespace YBP.Shared.Guards;

/// <summary>
/// Minimal, dependency-free guard clauses for enforcing invariants at the top of
/// domain methods and constructors. Kept in the Shared kernel so Domain can use it
/// without taking a third-party dependency.
/// </summary>
public static class Guard
{
    public static T AgainstNull<T>(T? value, [CallerArgumentExpression(nameof(value))] string? param = null)
        where T : class
        => value ?? throw new ArgumentNullException(param);

    public static string AgainstNullOrWhiteSpace(string? value, [CallerArgumentExpression(nameof(value))] string? param = null)
        => string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("Value cannot be null or whitespace.", param)
            : value;

    public static int AgainstNegative(int value, [CallerArgumentExpression(nameof(value))] string? param = null)
        => value < 0 ? throw new ArgumentOutOfRangeException(param, value, "Value cannot be negative.") : value;

    public static int AgainstNonPositive(int value, [CallerArgumentExpression(nameof(value))] string? param = null)
        => value <= 0 ? throw new ArgumentOutOfRangeException(param, value, "Value must be greater than zero.") : value;

    public static int AgainstOutOfRange(int value, int min, int max, [CallerArgumentExpression(nameof(value))] string? param = null)
        => value < min || value > max
            ? throw new ArgumentOutOfRangeException(param, value, $"Value must be between {min} and {max}.")
            : value;
}
