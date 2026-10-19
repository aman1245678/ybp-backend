import { randomUUID } from 'node:crypto';

/** Base class for all domain entities with identity-based equality. */
export class Entity {
  /** @param {string} [id] */
  constructor(id) {
    this.id = id ?? randomUUID();
  }

  equals(other) {
    if (other == null) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this.constructor === other.constructor && this.id === other.id;
  }
}
