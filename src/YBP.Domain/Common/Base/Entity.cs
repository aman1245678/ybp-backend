namespace YBP.Domain.Common.Base;

/// <summary>
/// Base class for all domain entities. Provides identity-based equality: two entities
/// are equal when they are the same concrete type and share the same <see cref="Id"/>.
/// </summary>
/// <typeparam name="TId">The identifier type (e.g. <see cref="System.Guid"/>).</typeparam>
public abstract class Entity<TId> : IEquatable<Entity<TId>>
    where TId : notnull
{
    /// <summary>The entity's unique identifier.</summary>
    public TId Id { get; protected set; }

    /// <summary>Creates an entity with the supplied identifier.</summary>
    /// <param name="id">The unique identifier.</param>
    protected Entity(TId id) => Id = id;

    /// <summary>Parameterless constructor reserved for ORM materialization. Not for domain use.</summary>
#pragma warning disable CS8618 // Id is set by the ORM when materializing.
    protected Entity() { }
#pragma warning restore CS8618

    /// <inheritdoc />
    public bool Equals(Entity<TId>? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return GetType() == other.GetType() && EqualityComparer<TId>.Default.Equals(Id, other.Id);
    }

    /// <inheritdoc />
    public override bool Equals(object? obj) => obj is Entity<TId> other && Equals(other);

    /// <inheritdoc />
    public override int GetHashCode() => HashCode.Combine(GetType(), Id);

    /// <summary>Identity equality operator.</summary>
    public static bool operator ==(Entity<TId>? left, Entity<TId>? right) => Equals(left, right);

    /// <summary>Identity inequality operator.</summary>
    public static bool operator !=(Entity<TId>? left, Entity<TId>? right) => !Equals(left, right);
}
