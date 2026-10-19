import { DomainGuard } from '../base/DomainGuard.js';
import { ValueObject } from '../base/ValueObject.js';

export class Location extends ValueObject {
  static MaxLength = 200;

  /** @param {string} city */
  constructor(city) {
    super();
    this.city = city;
  }

  /** @param {string|null|undefined} city @returns {Location|null} */
  static Create(city) {
    if (city == null || String(city).trim() === '') return null;
    return new Location(DomainGuard.maxLength(city, Location.MaxLength));
  }

  getEqualityComponents() {
    return [this.city];
  }
}
