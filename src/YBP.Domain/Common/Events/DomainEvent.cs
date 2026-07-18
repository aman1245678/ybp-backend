namespace YBP.Domain.Common.Events;

/// <summary>
/// Base record for all domain events. Concrete events add their payload and set
/// <see cref="OccurredOnUtc"/> at raise time (the raising aggregate supplies the timestamp,
/// keeping the domain free of any ambient clock dependency).
/// </summary>
public abstract record DomainEvent : IDomainEvent
{
    /// <inheritdoc />
    public Guid EventId { get; init; } = Guid.NewGuid();

    /// <inheritdoc />
    public DateTime OccurredOnUtc { get; init; }
}
