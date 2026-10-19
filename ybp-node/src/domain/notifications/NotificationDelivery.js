import { randomUUID } from 'node:crypto';
import { AuditableAggregateRoot } from '../common/base/AuditableAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { NotificationStatus } from '../common/enums/index.js';

export class NotificationDelivery extends AuditableAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.channel = null;
    this.provider = null;
    this.recipient = '';
    this.tag = null;
    this.templateKey = null;
    this.status = NotificationStatus.Queued;
    this.providerMessageId = null;
    this.error = null;
    this.attemptCount = 0;
    this.relatedType = null;
    this.relatedId = null;
  }

  /**
   * @param {string} channel
   * @param {string|null} recipient
   * @param {string|null} [templateKey]
   * @param {string|null} [provider]
   * @param {string|null} [tag]
   * @param {string|null} [relatedType]
   * @param {string|null} [relatedId]
   */
  static queue(
    channel,
    recipient,
    templateKey = null,
    provider = null,
    tag = null,
    relatedType = null,
    relatedId = null,
  ) {
    const delivery = new NotificationDelivery(randomUUID());
    delivery.channel = channel;
    delivery.recipient = DomainGuard.notNullOrWhiteSpace(recipient);
    delivery.templateKey = templateKey;
    delivery.provider = provider;
    delivery.tag = tag;
    delivery.relatedType = relatedType;
    delivery.relatedId = relatedId;
    delivery.status = NotificationStatus.Queued;
    return delivery;
  }

  /**
   * @param {string|null} providerMessageId
   * @param {Date} utcNow
   */
  markSent(providerMessageId, utcNow) {
    this.status = NotificationStatus.Sent;
    this.providerMessageId = providerMessageId;
    this.error = null;
    this.attemptCount += 1;
    this.markUpdated(utcNow);
  }

  /**
   * @param {string|null} error
   * @param {Date} utcNow
   */
  markFailed(error, utcNow) {
    this.status = NotificationStatus.Failed;
    this.error = error;
    this.attemptCount += 1;
    this.markUpdated(utcNow);
  }

  /**
   * @param {string|null} reason
   * @param {Date} utcNow
   */
  markSkipped(reason, utcNow) {
    this.status = NotificationStatus.Skipped;
    this.error = reason;
    this.markUpdated(utcNow);
  }
}
