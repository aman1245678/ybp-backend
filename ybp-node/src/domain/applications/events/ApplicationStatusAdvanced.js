import { DomainEvent } from '../../common/events/DomainEvent.js';

export class ApplicationStatusAdvanced extends DomainEvent {
  /**
   * @param {string} applicationId
   * @param {number} track
   * @param {number} fromStatus
   * @param {number} toStatus
   * @param {string|null} byUserId
   * @param {{ occurredOnUtc?: Date }} [options]
   */
  constructor(applicationId, track, fromStatus, toStatus, byUserId, options = {}) {
    super();
    this.applicationId = applicationId;
    this.track = track;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.byUserId = byUserId;
    if (options.occurredOnUtc != null) this.occurredOnUtc = options.occurredOnUtc;
  }
}
