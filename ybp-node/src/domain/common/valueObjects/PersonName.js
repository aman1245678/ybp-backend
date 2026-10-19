import { DomainGuard } from '../base/DomainGuard.js';
import { ValueObject } from '../base/ValueObject.js';

export class PersonName extends ValueObject {
  static MinLength = 2;

  /** @param {string} fullName */
  constructor(fullName) {
    super();
    this.fullName = fullName;
  }

  /** @param {string|null|undefined} fullName */
  static Create(fullName) {
    const value = DomainGuard.notNullOrWhiteSpace(fullName);
    DomainGuard.requires(
      value.length >= PersonName.MinLength,
      `Name must be at least ${PersonName.MinLength} characters.`,
    );
    return new PersonName(value);
  }

  /** @param {string|null|undefined} firstName @param {string|null|undefined} lastName */
  static CreateFromParts(firstName, lastName) {
    const first = DomainGuard.notNullOrWhiteSpace(firstName);
    const last = DomainGuard.notNullOrWhiteSpace(lastName);
    DomainGuard.requires(
      first.length >= PersonName.MinLength,
      `First name must be at least ${PersonName.MinLength} characters.`,
    );
    DomainGuard.requires(
      last.length >= PersonName.MinLength,
      `Last name must be at least ${PersonName.MinLength} characters.`,
    );
    return new PersonName(`${first} ${last}`);
  }

  getEqualityComponents() {
    return [this.fullName];
  }
}
