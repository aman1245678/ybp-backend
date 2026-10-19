import { DomainGuard } from '../base/DomainGuard.js';
import { ValueObject } from '../base/ValueObject.js';

export class CompensationBand extends ValueObject {
  /** @param {string} slug @param {string|null} [label] */
  constructor(slug, label = null) {
    super();
    this.slug = slug;
    this.label = label;
  }

  /** @param {string|null|undefined} slug @param {string|null|undefined} [label] */
  static Create(slug, label = null) {
    return new CompensationBand(
      DomainGuard.notNullOrWhiteSpace(slug),
      DomainGuard.maxLength(label, 200),
    );
  }

  getEqualityComponents() {
    return [this.slug, this.label];
  }
}
