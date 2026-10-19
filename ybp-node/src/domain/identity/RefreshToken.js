import { randomUUID } from 'node:crypto';
import { Entity } from '../common/base/Entity.js';
import { DomainGuard } from '../common/base/DomainGuard.js';

export class RefreshToken extends Entity {
  /**
   * @param {string} id
   * @param {string} token
   * @param {Date} expiresAtUtc
   * @param {Date} createdAtUtc
   */
  constructor(id, token, expiresAtUtc, createdAtUtc) {
    super(id);
    this.token = token;
    this.expiresAtUtc = expiresAtUtc;
    this.createdAtUtc = createdAtUtc;
    this.revokedAtUtc = null;
    this.replacedByToken = null;
  }

  /**
   * @param {string|null} token
   * @param {Date} createdAtUtc
   * @param {Date} expiresAtUtc
   */
  static issue(token, createdAtUtc, expiresAtUtc) {
    const value = DomainGuard.notNullOrWhiteSpace(token);
    DomainGuard.requires(expiresAtUtc > createdAtUtc, 'A refresh token must expire after it is created.');
    return new RefreshToken(randomUUID(), value, expiresAtUtc, createdAtUtc);
  }

  /** @param {Date} utcNow */
  isActive(utcNow) {
    return this.revokedAtUtc == null && utcNow <= this.expiresAtUtc;
  }

  /**
   * @param {Date} utcNow
   * @param {string|null} [replacedByToken]
   */
  revoke(utcNow, replacedByToken = null) {
    if (this.revokedAtUtc != null) return;
    this.revokedAtUtc = utcNow;
    this.replacedByToken = replacedByToken;
  }
}
