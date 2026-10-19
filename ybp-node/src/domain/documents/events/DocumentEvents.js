import { DomainEvent } from '../../common/events/DomainEvent.js';

export class DocumentUploaded extends DomainEvent {
  /** @param {string} documentId @param {string} purpose */
  constructor(documentId, purpose) {
    super();
    this.documentId = documentId;
    this.purpose = purpose;
  }
}

export class DocumentScanned extends DomainEvent {
  /** @param {string} documentId @param {string} status */
  constructor(documentId, status) {
    super();
    this.documentId = documentId;
    this.status = status;
  }
}
