import { randomUUID } from 'node:crypto';
import { AuditableAggregateRoot } from '../common/base/AuditableAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';

export class Role extends AuditableAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    /** @type {Set<string>} */
    this._permissionCodes = new Set();
    this.type = null;
    this.name = '';
  }

  /** @type {readonly string[]} */
  get permissionCodes() {
    return Object.freeze([...this._permissionCodes]);
  }

  /** @param {string} type @param {string|null} name */
  static create(type, name) {
    const role = new Role(randomUUID());
    role.type = type;
    role.name = DomainGuard.notNullOrWhiteSpace(name);
    return role;
  }

  /** @param {string|null} permissionCode @param {Date} utcNow */
  grantPermission(permissionCode, utcNow) {
    const code = DomainGuard.notNullOrWhiteSpace(permissionCode);
    if (this.hasPermission(code)) return;
    this._permissionCodes.add(code);
    this.markUpdated(utcNow);
  }

  /** @param {string|null} permissionCode @param {Date} utcNow */
  revokePermission(permissionCode, utcNow) {
    if (permissionCode == null) return;
    if (this._permissionCodes.delete(permissionCode)) {
      this.markUpdated(utcNow);
    }
  }

  /** @param {string} permissionCode */
  hasPermission(permissionCode) {
    const target = permissionCode.toLowerCase();
    for (const code of this._permissionCodes) {
      if (code.toLowerCase() === target) return true;
    }
    return false;
  }
}
