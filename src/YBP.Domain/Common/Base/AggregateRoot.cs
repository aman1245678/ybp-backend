using YBP.Domain.Common.Events;

namespace YBP.Domain.Common.Base;

/// <summary>
/// Base class for aggregate roots. Adds domain-event recording on top of
/// identity-based <see cref="Entity{TId}"/> equality.
/// </summary>
/// <typeparam name="TId">The identifier type.</typeparam>
public abstract class AggregateRoot<TId> : Entity<TId>, IAggregateRoot
    where TId : notnull
{
    private readonly List<IDomainEvent> _domainEvents = [];

    /// <summary>The domain events raised by this aggregate during the current unit of work.</summary>
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    /// <summary>Creates an aggregate root with the supplied identifier.</summary>
    /// <param name="id">The unique identifier.</param>
    protected AggregateRoot(TId id) : base(id) { }

    /// <summary>Parameterless constructor reserved for ORM materialization.</summary>
    protected AggregateRoot() { }

    /// <summary>Records a domain event to be dispatched after persistence.</summary>
    /// <param name="domainEvent">The event to raise.</param>
    protected void RaiseDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);

    /// <summary>Clears the recorded domain events (called by the dispatcher after handling).</summary>
    public void ClearDomainEvents() => _domainEvents.Clear();
}
