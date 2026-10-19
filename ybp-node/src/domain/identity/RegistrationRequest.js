import { randomUUID } from 'node:crypto';
import { AuditableAggregateRoot } from '../common/base/AuditableAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { RegistrationRequestStatus } from '../common/enums/index.js';
import { CredentialsIssued, RegistrationRequested } from './events/IdentityEvents.js';

export class RegistrationRequest extends AuditableAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.name = null;
    this.mobile = null;
    this.email = null;
    this.category = null;
    this.description = null;
    this.status = RegistrationRequestStatus.Requested;
    this.issuedUserId = null;
  }

  /**
   * @param {import('../common/valueObjects/PersonName.js').PersonName} name
   * @param {import('../common/valueObjects/MobileNumber.js').MobileNumber} mobile
   * @param {import('../common/valueObjects/EmailAddress.js').EmailAddress} email
   * @param {string} category
   * @param {Date} utcNow
   * @param {string|null} [description]
   */
  static create(name, mobile, email, category, utcNow, description = null) {
    const request = new RegistrationRequest(randomUUID());
    request.name = DomainGuard.notNull(name);
    request.mobile = DomainGuard.notNull(mobile);
    request.email = DomainGuard.notNull(email);
    request.category = category;
    request.description = DomainGuard.maxLength(description, 2000);
    request.status = RegistrationRequestStatus.Requested;

    const event = new RegistrationRequested(request.id, email.value, category);
    event.occurredOnUtc = utcNow;
    request.raiseDomainEvent(event);

    return request;
  }

  /** @param {Date} utcNow */
  approve(utcNow) {
    DomainGuard.requires(
      this.status === RegistrationRequestStatus.Requested,
      'Only a requested registration can be approved.',
    );
    this.status = RegistrationRequestStatus.Approved;
    this.markUpdated(utcNow);
  }

  /** @param {Date} utcNow */
  reject(utcNow) {
    DomainGuard.requires(
      this.status !== RegistrationRequestStatus.Issued,
      'An issued registration cannot be rejected.',
    );
    this.status = RegistrationRequestStatus.Rejected;
    this.markUpdated(utcNow);
  }

  /** @param {string} userId @param {Date} utcNow */
  markIssued(userId, utcNow) {
    DomainGuard.requires(
      this.status === RegistrationRequestStatus.Approved,
      'Credentials can only be issued for an approved registration.',
    );
    this.status = RegistrationRequestStatus.Issued;
    this.issuedUserId = userId;
    this.markUpdated(utcNow);

    const event = new CredentialsIssued(userId, this.id);
    event.occurredOnUtc = utcNow;
    this.raiseDomainEvent(event);
  }
}
