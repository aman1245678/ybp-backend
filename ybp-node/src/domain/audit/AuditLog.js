import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '../common/base/AggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';

export class AuditLog extends AggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.action = null;
    this.entityType = '';
    this.entityId = null;
    this.performedByUserId = null;
    this.detail = null;
    this.occurredAtUtc = null;
  }

  /**
   * @param {string} action
   * @param {string|null} entityType
   * @param {Date} utcNow
   * @param {string|null} [entityId]
   * @param {string|null} [performedByUserId]
   * @param {string|null} [detail]
   */
  static record(action, entityType, utcNow, entityId = null, performedByUserId = null, detail = null) {
    const log = new AuditLog(randomUUID());
    log.action = action;
    log.entityType = DomainGuard.notNullOrWhiteSpace(entityType);
    log.entityId = entityId;
    log.performedByUserId = performedByUserId;
    log.detail = DomainGuard.maxLength(detail, 4000);
    log.occurredAtUtc = utcNow;
    return log;
  }
}
