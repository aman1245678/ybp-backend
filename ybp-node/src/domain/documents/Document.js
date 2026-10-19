import { randomUUID } from 'node:crypto';
import { AuditableAggregateRoot } from '../common/base/AuditableAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { DocumentOwnerType, ScanStatus, UploadStatus } from '../common/enums/index.js';
import { DocumentScanned, DocumentUploaded } from './events/DocumentEvents.js';

export class Document extends AuditableAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.metadata = null;
    this.purpose = null;
    this.ownerType = DocumentOwnerType.Unassigned;
    this.ownerId = null;
    this.storageKey = null;
    this.url = null;
    this.uploadStatus = UploadStatus.Pending;
    this.scanStatus = ScanStatus.Pending;
    this.error = null;
  }

  /**
   * @param {import('../common/valueObjects/FileMetadata.js').FileMetadata} metadata
   * @param {string} purpose
   */
  static register(metadata, purpose) {
    const document = new Document(randomUUID());
    document.metadata = DomainGuard.notNull(metadata);
    document.purpose = purpose;
    document.uploadStatus = UploadStatus.Pending;
    document.scanStatus = ScanStatus.Pending;
    return document;
  }

  /**
   * @param {string|null} storageKey
   * @param {string|null} url
   * @param {Date} utcNow
   */
  markUploaded(storageKey, url, utcNow) {
    this.storageKey = DomainGuard.notNullOrWhiteSpace(storageKey);
    this.url = DomainGuard.notNullOrWhiteSpace(url);
    this.uploadStatus = UploadStatus.Uploaded;
    this.error = null;
    this.markUpdated(utcNow);

    const event = new DocumentUploaded(this.id, this.purpose);
    event.occurredOnUtc = utcNow;
    this.raiseDomainEvent(event);
  }

  /** @param {string} error @param {Date} utcNow */
  markUploadFailed(error, utcNow) {
    this.uploadStatus = UploadStatus.Error;
    this.error = DomainGuard.notNullOrWhiteSpace(error);
    this.markUpdated(utcNow);
  }

  /** @param {string} status @param {Date} utcNow */
  markScanned(status, utcNow) {
    this.scanStatus = status;
    this.markUpdated(utcNow);

    const event = new DocumentScanned(this.id, status);
    event.occurredOnUtc = utcNow;
    this.raiseDomainEvent(event);
  }

  /**
   * @param {string} ownerType
   * @param {string} ownerId
   * @param {Date} utcNow
   */
  attachToOwner(ownerType, ownerId, utcNow) {
    DomainGuard.requires(
      ownerType !== DocumentOwnerType.Unassigned,
      'A document owner type must be specified.',
    );
    this.ownerType = ownerType;
    this.ownerId = ownerId;
    this.markUpdated(utcNow);
  }

  get isOrphan() {
    return this.ownerType === DocumentOwnerType.Unassigned;
  }
}
