namespace YBP.Domain.Common.Base;

/// <summary>
/// Base class for immutable value objects. Equality is structural: two value objects are
/// equal when they are the same type and all their equality components are equal.
/// Derived types expose validated factory methods and never public setters.
/// </summary>
public abstract class ValueObject : IEquatable<ValueObject>
{
    /// <summary>Yields the components that participate in structural equality, in order.</summary>
    protected abstract IEnumerable<object?> GetEqualityComponents();

    /// <inheritdoc />
    public bool Equals(ValueObject? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return GetType() == other.GetType()
            && GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    /// <inheritdoc />
    public override bool Equals(object? obj) => obj is ValueObject other && Equals(other);

    /// <inheritdoc />
    public override int GetHashCode()
    {
        var hash = new HashCode();
        foreach (var component in GetEqualityComponents())
            hash.Add(component);
        return hash.ToHashCode();
    }

    /// <summary>Structural equality operator.</summary>
    public static bool operator ==(ValueObject? left, ValueObject? right) => Equals(left, right);

    /// <summary>Structural inequality operator.</summary>
    public static bool operator !=(ValueObject? left, ValueObject? right) => !Equals(left, right);
}
