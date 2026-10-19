import { DomainException } from '../exceptions/DomainException.js';
import { ValueObject } from '../base/ValueObject.js';

export class DateRange extends ValueObject {
  /** @param {Date} startUtc @param {Date|null} [endUtc] */
  constructor(startUtc, endUtc = null) {
    super();
    this.startUtc = startUtc;
    this.endUtc = endUtc;
  }

  /** @param {Date} startUtc @param {Date|null} [endUtc] */
  static Create(startUtc, endUtc = null) {
    if (endUtc != null && endUtc < startUtc)
      throw new DomainException('The end of a date range cannot be before its start.');
    return new DateRange(startUtc, endUtc);
  }

  /** @param {Date} instantUtc */
  Contains(instantUtc) {
    return instantUtc >= this.startUtc && (this.endUtc == null || instantUtc <= this.endUtc);
  }

  getEqualityComponents() {
    return [this.startUtc, this.endUtc];
  }
}
