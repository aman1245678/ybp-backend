import { DomainGuard } from '../base/DomainGuard.js';
import { DomainException } from '../exceptions/DomainException.js';
import { ValueObject } from '../base/ValueObject.js';

/** @param {string} tenDigits */
function isLeadingSix(tenDigits) {
  return tenDigits.length === 10 && tenDigits[0] >= '6' && tenDigits[0] <= '9';
}

export class MobileNumber extends ValueObject {
  /** @param {string} value */
  constructor(value) {
    super();
    this.value = value;
  }

  /** @param {string|null|undefined} value */
  static Create(value) {
    const raw = DomainGuard.notNullOrWhiteSpace(value);
    const normalized = MobileNumber.Normalize(raw);
    if (normalized == null)
      throw new DomainException('Mobile number is not a valid Indian mobile number.');
    return new MobileNumber(normalized);
  }

  /** @param {string|null|undefined} value @returns {string|null} */
  static Normalize(value) {
    if (value == null || String(value).trim() === '') return null;
    const digits = String(value).replace(/\D/g, '');

    if (digits.length === 10 && isLeadingSix(digits)) return digits;
    if (digits.length === 12 && digits.startsWith('91')) {
      const rest = digits.slice(2);
      return isLeadingSix(rest) ? rest : null;
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      const rest = digits.slice(1);
      return isLeadingSix(rest) ? rest : null;
    }
    return null;
  }

  getEqualityComponents() {
    return [this.value];
  }
}
