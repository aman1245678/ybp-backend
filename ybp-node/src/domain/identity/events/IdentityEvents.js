import { DomainEvent } from '../../common/events/DomainEvent.js';

export class RegistrationRequested extends DomainEvent {
  /** @param {string} registrationRequestId @param {string} email @param {string} category */
  constructor(registrationRequestId, email, category) {
    super();
    this.registrationRequestId = registrationRequestId;
    this.email = email;
    this.category = category;
  }
}

export class UserRegistered extends DomainEvent {
  /** @param {string} userId @param {string} email */
  constructor(userId, email) {
    super();
    this.userId = userId;
    this.email = email;
  }
}

export class CredentialsIssued extends DomainEvent {
  /** @param {string} userId @param {string} registrationRequestId */
  constructor(userId, registrationRequestId) {
    super();
    this.userId = userId;
    this.registrationRequestId = registrationRequestId;
  }
}

export class PasswordResetRequested extends DomainEvent {
  /** @param {string} userId @param {string} email */
  constructor(userId, email) {
    super();
    this.userId = userId;
    this.email = email;
  }
}
