import { AggregateRoot } from './AggregateRoot.js';

/** Aggregate root with audit, soft-delete, and concurrency fields. */
export class AuditableAggregateRoot extends AggregateRoot {
  /** @param {string} [id] */
  constructor(id) {
    super(id);
    this.createdAtUtc = null;
    this.createdBy = null;
    this.updatedAtUtc = null;
    this.updatedBy = null;
    this.isDeleted = false;
    this.deletedAtUtc = null;
    this.deletedBy = null;
    this.rowVersion = Buffer.alloc(0);
  }

  /** @param {Date} utcNow @param {string|null} [by] */
  markUpdated(utcNow, by = null) {
    this.updatedAtUtc = utcNow;
    this.updatedBy = by;
  }

  /** @param {Date} utcNow @param {string|null} [by] */
  markDeleted(utcNow, by = null) {
    if (this.isDeleted) {
      return;
    }
    this.isDeleted = true;
    this.deletedAtUtc = utcNow;
    this.deletedBy = by;
  }

  restore() {
    if (!this.isDeleted) {
      return;
    }
    this.isDeleted = false;
    this.deletedAtUtc = null;
    this.deletedBy = null;
  }
}
