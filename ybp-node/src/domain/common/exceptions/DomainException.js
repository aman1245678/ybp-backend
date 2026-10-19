/** Raised when a domain invariant or business rule is violated. */
export class DomainException extends globalThis.Error {
  /**
   * @param {string} message
   * @param {globalThis.Error} [innerException]
   */
  constructor(message, innerException) {
    super(message);
    this.name = 'DomainException';
    if (innerException) {
      this.cause = innerException;
    }
  }
}

/** Raised when an application status transition is not permitted by the workflow. */
export class InvalidStatusTransitionException extends DomainException {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'InvalidStatusTransitionException';
  }
}
