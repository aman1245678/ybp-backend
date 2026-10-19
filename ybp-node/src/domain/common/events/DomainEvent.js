import { randomUUID } from 'node:crypto';

/** Base class for all domain events. */
export class DomainEvent {
  constructor() {
    this.eventId = randomUUID();
    /** @type {Date|null} */
    this.occurredOnUtc = null;
  }
}
