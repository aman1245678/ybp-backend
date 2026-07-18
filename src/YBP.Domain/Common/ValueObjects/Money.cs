using YBP.Domain.Common.Base;
using YBP.Domain.Common.Exceptions;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// A monetary amount with a currency. Reserved for numeric budgets/metrics (the public forms use
/// <see cref="CompensationBand"/> today); defaults to Indian Rupees.
/// </summary>
public sealed class Money : ValueObject
{
    /// <summary>The default ISO currency code.</summary>
    public const string DefaultCurrency = "INR";

    /// <summary>The amount (non-negative).</summary>
    public decimal Amount { get; private set; }

    /// <summary>The ISO 4217 currency code.</summary>
    public string Currency { get; private set; }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    private Money() => Currency = DefaultCurrency; // ORM

    /// <summary>Zero rupees.</summary>
    public static Money Zero => new(0m, DefaultCurrency);

    /// <summary>Creates a validated <see cref="Money"/> value.</summary>
    /// <param name="amount">The amount (must be zero or positive).</param>
    /// <param name="currency">The ISO currency code (defaults to INR).</param>
    /// <exception cref="DomainException">Thrown when the amount is negative.</exception>
    public static Money Create(decimal amount, string currency = DefaultCurrency)
    {
        DomainGuard.Requires(amount >= 0, "Amount cannot be negative.");
        return new Money(amount, DomainGuard.NotNullOrWhiteSpace(currency).ToUpperInvariant());
    }

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    /// <inheritdoc />
    public override string ToString() => $"{Currency} {Amount:0.##}";
}
