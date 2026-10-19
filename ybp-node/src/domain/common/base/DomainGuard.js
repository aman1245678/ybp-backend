import { DomainException } from '../exceptions/DomainException.js';

/** Guard clauses that enforce domain invariants by throwing DomainException. */
export class DomainGuard {
  static notNullOrWhiteSpace(value, field = 'value') {
    if (value == null || String(value).trim() === '') {
      throw new DomainException(`${field} is required.`);
    }
    return String(value).trim();
  }

  static notNull(value, field = 'value') {
    if (value == null) {
      throw new DomainException(`${field} is required.`);
    }
    return value;
  }

  static requires(condition, message) {
    if (!condition) {
      throw new DomainException(message);
    }
  }

  static atLeast(value, min, field = 'value') {
    if (value < min) {
      throw new DomainException(`${field} must be at least ${min}.`);
    }
    return value;
  }

  static maxLength(value, maxLength, field = 'value') {
    const trimmed = value == null ? null : String(value).trim();
    if (trimmed != null && trimmed.length > maxLength) {
      throw new DomainException(`${field} must be ${maxLength} characters or fewer.`);
    }
    return trimmed;
  }
}
