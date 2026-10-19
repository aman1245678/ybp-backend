function argumentNullException(param) {
  const err = new TypeError(`Value cannot be null. (Parameter '${param}')`);
  err.name = 'ArgumentNullException';
  return err;
}

function argumentException(message, param) {
  const err = new globalThis.Error(message);
  err.name = 'ArgumentException';
  err.paramName = param;
  return err;
}

function argumentOutOfRangeException(param, value, message) {
  const err = new RangeError(message);
  err.name = 'ArgumentOutOfRangeException';
  err.paramName = param;
  err.actualValue = value;
  return err;
}

/** Minimal guard clauses for enforcing invariants at the top of domain methods. */
export class Guard {
  static againstNull(value, param = 'value') {
    if (value == null) {
      throw argumentNullException(param);
    }
    return value;
  }

  static againstNullOrWhiteSpace(value, param = 'value') {
    if (value == null || String(value).trim() === '') {
      throw argumentException('Value cannot be null or whitespace.', param);
    }
    return value;
  }

  static againstNegative(value, param = 'value') {
    if (value < 0) {
      throw argumentOutOfRangeException(param, value, 'Value cannot be negative.');
    }
    return value;
  }

  static againstNonPositive(value, param = 'value') {
    if (value <= 0) {
      throw argumentOutOfRangeException(param, value, 'Value must be greater than zero.');
    }
    return value;
  }

  static againstOutOfRange(value, min, max, param = 'value') {
    if (value < min || value > max) {
      throw argumentOutOfRangeException(
        param,
        value,
        `Value must be between ${min} and ${max}.`,
      );
    }
    return value;
  }
}
