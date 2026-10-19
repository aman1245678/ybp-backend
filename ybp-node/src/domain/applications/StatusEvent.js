import { randomUUID } from 'node:crypto';
import { Entity } from '../common/base/Entity.js';
import { DomainGuard } from '../common/base/DomainGuard.js';

export class StatusEvent extends Entity {
  /**
   * @param {string} id
   * @param {string} status
   * @param {Date} atUtc
   * @param {string|null} note
   * @param {string|null} byUserId
   */
  constructor(id, status, atUtc, note, byUserId) {
    super(id);
    this.status = status;
    this.atUtc = atUtc;
    this.note = note;
    this.byUserId = byUserId;
  }

  /**
   * @param {string} status
   * @param {Date} atUtc
   * @param {string|null} [note]
   * @param {string|null} [byUserId]
   */
  static create(status, atUtc, note = null, byUserId = null) {
    return new StatusEvent(
      randomUUID(),
      status,
      atUtc,
      DomainGuard.maxLength(note, 1000),
      byUserId,
    );
  }
}
