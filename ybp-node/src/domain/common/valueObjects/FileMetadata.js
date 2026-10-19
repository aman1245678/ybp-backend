import { DomainGuard } from '../base/DomainGuard.js';
import { ValueObject } from '../base/ValueObject.js';

export class FileMetadata extends ValueObject {
  /** @param {string} name @param {string} mimeType @param {number} kind @param {number} sizeBytes */
  constructor(name, mimeType, kind, sizeBytes) {
    super();
    this.name = name;
    this.mimeType = mimeType;
    this.kind = kind;
    this.sizeBytes = sizeBytes;
  }

  /** @param {string|null|undefined} name @param {string|null|undefined} mimeType @param {number} kind @param {number} sizeBytes */
  static Create(name, mimeType, kind, sizeBytes) {
    const safeName = DomainGuard.notNullOrWhiteSpace(name);
    const safeMime = DomainGuard.notNullOrWhiteSpace(mimeType);
    DomainGuard.requires(sizeBytes >= 0, 'File size cannot be negative.');
    return new FileMetadata(safeName, safeMime, kind, sizeBytes);
  }

  getEqualityComponents() {
    return [this.name, this.mimeType, this.kind, this.sizeBytes];
  }
}
