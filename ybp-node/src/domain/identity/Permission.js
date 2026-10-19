import { randomUUID } from 'node:crypto';
import { AuditableAggregateRoot } from '../common/base/AuditableAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';

export class Permission extends AuditableAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.code = '';
    this.description = null;
  }

  /** @param {string|null} code @param {string|null} [description] */
  static create(code, description = null) {
    const permission = new Permission(randomUUID());
    permission.code = DomainGuard.notNullOrWhiteSpace(code);
    permission.description = DomainGuard.maxLength(description, 500);
    return permission;
  }

  /** @param {string|null} description @param {Date} utcNow */
  updateDescription(description, utcNow) {
    this.description = DomainGuard.maxLength(description, 500);
    this.markUpdated(utcNow);
  }
}
