import { Entity } from './Entity.js';

/** Base class for aggregate roots with domain-event recording. */
export class AggregateRoot extends Entity {
  /** @param {string} [id] */
  constructor(id) {
    super(id);
    /** @type {import('../events/DomainEvent.js').DomainEvent[]} */
    this._domainEvents = [];
  }

  get domainEvents() {
    return Object.freeze([...this._domainEvents]);
  }

  /** @param {import('../events/DomainEvent.js').DomainEvent} domainEvent */
  raiseDomainEvent(domainEvent) {
    this._domainEvents.push(domainEvent);
  }

  clearDomainEvents() {
    this._domainEvents.length = 0;
  }
}
