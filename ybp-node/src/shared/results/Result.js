import { Error } from './Error.js';

class ResultInvariantError extends globalThis.Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidOperationException';
  }
}

/** The outcome of an operation that can fail without throwing. */
export class Result {
  constructor(isSuccess, error) {
    if (isSuccess && error !== Error.None) {
      throw new ResultInvariantError('A successful result cannot carry an error.');
    }
    if (!isSuccess && error === Error.None) {
      throw new ResultInvariantError('A failed result must carry an error.');
    }
    this.isSuccess = isSuccess;
    this.error = error;
  }

  get isFailure() {
    return !this.isSuccess;
  }

  static Success() {
    return new Result(true, Error.None);
  }

  static Failure(error) {
    return new Result(false, error);
  }

  /** Mirrors C# Result.Success&lt;T&gt;(T value). */
  static SuccessValue(value) {
    return new ResultValue(value, true, Error.None);
  }

  /** Mirrors C# Result.Failure&lt;T&gt;(Error error). */
  static FailureValue(error) {
    return new ResultValue(undefined, false, error);
  }
}

/** A Result that carries a value on success. */
export class ResultValue extends Result {
  constructor(value, isSuccess, error) {
    super(isSuccess, error);
    this._value = value;
  }

  /** The value produced on success. Throws if accessed on a failed result. */
  get value() {
    if (!this.isSuccess) {
      throw new ResultInvariantError('Cannot access the value of a failed result.');
    }
    return this._value;
  }

  static Success(value) {
    return new ResultValue(value, true, Error.None);
  }

  static Failure(error) {
    return new ResultValue(undefined, false, error);
  }
}
