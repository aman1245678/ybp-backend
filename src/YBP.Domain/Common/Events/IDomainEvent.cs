namespace YBP.Domain.Common.Events;

/// <summary>
/// A fact that has happened within the domain and may be reacted to by other parts of
/// the system (notifications, audit, dashboards). Raised by aggregate roots and dispatched
/// after the aggregate is persisted.
/// </summary>
public interface IDomainEvent
{
    /// <summary>Unique identifier of this event occurrence (useful for idempotent handling/outbox).</summary>
    Guid EventId { get; }

    /// <summary>UTC instant at which the event occurred.</summary>
    DateTime OccurredOnUtc { get; }
}
