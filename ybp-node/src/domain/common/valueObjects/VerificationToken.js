import { DomainGuard } from '../base/DomainGuard.js';
import { ValueObject } from '../base/ValueObject.js';

export class VerificationToken extends ValueObject {
  /** @param {string} value @param {number} channel @param {Date} issuedAtUtc */
  constructor(value, channel, issuedAtUtc) {
    super();
    this.value = value;
    this.channel = channel;
    this.issuedAtUtc = issuedAtUtc;
  }

  /** @param {string|null|undefined} value @param {number} channel @param {Date} issuedAtUtc */
  static Create(value, channel, issuedAtUtc) {
    return new VerificationToken(
      DomainGuard.notNullOrWhiteSpace(value),
      channel,
      issuedAtUtc,
    );
  }

  getEqualityComponents() {
    return [this.value, this.channel, this.issuedAtUtc];
  }
}
