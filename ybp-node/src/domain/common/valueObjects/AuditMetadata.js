import { ValueObject } from '../base/ValueObject.js';

export class AuditMetadata extends ValueObject {
  /** @param {Date} createdAtUtc @param {string|null} [createdBy] @param {Date|null} [updatedAtUtc] @param {string|null} [updatedBy] */
  constructor(createdAtUtc, createdBy = null, updatedAtUtc = null, updatedBy = null) {
    super();
    this.createdAtUtc = createdAtUtc;
    this.createdBy = createdBy;
    this.updatedAtUtc = updatedAtUtc;
    this.updatedBy = updatedBy;
  }

  /** @param {Date} createdAtUtc @param {string|null} [createdBy] */
  static ForCreation(createdAtUtc, createdBy = null) {
    return new AuditMetadata(createdAtUtc, createdBy, null, null);
  }

  /** @param {Date} updatedAtUtc @param {string|null} [updatedBy] */
  WithUpdate(updatedAtUtc, updatedBy = null) {
    return new AuditMetadata(this.createdAtUtc, this.createdBy, updatedAtUtc, updatedBy);
  }

  getEqualityComponents() {
    return [this.createdAtUtc, this.createdBy, this.updatedAtUtc, this.updatedBy];
  }
}
