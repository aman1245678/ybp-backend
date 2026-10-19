import { ErrorType } from './ErrorType.js';

/** Immutable, framework-neutral description of a failure. */
export class Error {
  constructor(code, message, type = ErrorType.Failure) {
    this.code = code;
    this.message = message;
    this.type = type;
  }

  /** Sentinel used by successful results. */
  static None = new Error('', '');

  static Failure(code, message) {
    return new Error(code, message, ErrorType.Failure);
  }

  static Validation(code, message) {
    return new Error(code, message, ErrorType.Validation);
  }

  static NotFound(code, message) {
    return new Error(code, message, ErrorType.NotFound);
  }

  static Conflict(code, message) {
    return new Error(code, message, ErrorType.Conflict);
  }

  static Unauthorized(code, message) {
    return new Error(code, message, ErrorType.Unauthorized);
  }

  static Forbidden(code, message) {
    return new Error(code, message, ErrorType.Forbidden);
  }
}
