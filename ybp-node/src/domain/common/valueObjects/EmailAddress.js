import { DomainGuard } from '../base/DomainGuard.js';
import { DomainException } from '../exceptions/DomainException.js';
import { ValueObject } from '../base/ValueObject.js';

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export class EmailAddress extends ValueObject {
  static MaxLength = 256;

  /** @param {string} value */
  constructor(value) {
    super();
    this.value = value;
  }

  /** @param {string|null|undefined} value */
  static Create(value) {
    const normalized = DomainGuard.notNullOrWhiteSpace(value).toLowerCase();
    if (normalized.length > EmailAddress.MaxLength)
      throw new DomainException(`Email must be ${EmailAddress.MaxLength} characters or fewer.`);
    if (!EMAIL_REGEX.test(normalized))
      throw new DomainException('Email is not in a valid format.');
    return new EmailAddress(normalized);
  }

  getEqualityComponents() {
    return [this.value];
  }
}
