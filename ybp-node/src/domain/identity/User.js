import { randomUUID } from 'node:crypto';
import { AuditableAggregateRoot } from '../common/base/AuditableAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { UserStatus } from '../common/enums/index.js';
import { PasswordResetRequested, UserRegistered } from './events/IdentityEvents.js';
import { RefreshToken } from './RefreshToken.js';

export class User extends AuditableAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    /** @type {Set<string>} */
    this._roles = new Set();
    /** @type {RefreshToken[]} */
    this._refreshTokens = [];
    this.name = null;
    this.email = null;
    this.mobile = null;
    this.status = UserStatus.Invited;
    this.isEmailVerified = false;
    this.isMobileVerified = false;
  }

  /** @type {readonly string[]} */
  get roles() {
    return Object.freeze([...this._roles]);
  }

  /** @type {readonly RefreshToken[]} */
  get refreshTokens() {
    return Object.freeze([...this._refreshTokens]);
  }

  /**
   * @param {import('../common/valueObjects/PersonName.js').PersonName} name
   * @param {import('../common/valueObjects/EmailAddress.js').EmailAddress} email
   * @param {Date} utcNow
   * @param {import('../common/valueObjects/MobileNumber.js').MobileNumber|null} [mobile]
   * @param {string} [status]
   */
  static register(name, email, utcNow, mobile = null, status = UserStatus.Invited) {
    const user = new User(randomUUID());
    user.name = DomainGuard.notNull(name);
    user.email = DomainGuard.notNull(email);
    user.mobile = mobile;
    user.status = status;

    const event = new UserRegistered(user.id, email.value);
    event.occurredOnUtc = utcNow;
    user.raiseDomainEvent(event);

    return user;
  }

  /** @param {string} role @param {Date} utcNow */
  assignRole(role, utcNow) {
    if (!this._roles.has(role)) {
      this._roles.add(role);
      this.markUpdated(utcNow);
    }
  }

  /** @param {string} role @param {Date} utcNow */
  removeRole(role, utcNow) {
    if (this._roles.delete(role)) {
      this.markUpdated(utcNow);
    }
  }

  /** @param {string} role */
  isInRole(role) {
    return this._roles.has(role);
  }

  /** @param {Date} utcNow */
  activate(utcNow) {
    this.status = UserStatus.Active;
    this.markUpdated(utcNow);
  }

  /** @param {Date} utcNow */
  deactivate(utcNow) {
    this.status = UserStatus.Deactivated;
    this.markUpdated(utcNow);
  }

  /** @param {Date} utcNow */
  suspend(utcNow) {
    this.status = UserStatus.Suspended;
    this.markUpdated(utcNow);
  }

  /** @param {Date} utcNow */
  markEmailVerified(utcNow) {
    this.isEmailVerified = true;
    this.markUpdated(utcNow);
  }

  /** @param {Date} utcNow */
  markMobileVerified(utcNow) {
    this.isMobileVerified = true;
    this.markUpdated(utcNow);
  }

  /** @param {RefreshToken} token */
  addRefreshToken(token) {
    this._refreshTokens.push(DomainGuard.notNull(token));
  }

  /**
   * @param {string} token
   * @param {Date} utcNow
   * @param {string|null} [replacedByToken]
   */
  revokeRefreshToken(token, utcNow, replacedByToken = null) {
    this._refreshTokens.find((t) => t.token === token)?.revoke(utcNow, replacedByToken);
  }

  /** @param {Date} utcNow */
  requestPasswordReset(utcNow) {
    const event = new PasswordResetRequested(this.id, this.email.value);
    event.occurredOnUtc = utcNow;
    this.raiseDomainEvent(event);
  }
}
