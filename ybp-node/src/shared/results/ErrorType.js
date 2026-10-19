/** Classification of an Error, used to map a failed Result onto an HTTP status code. */
export const ErrorType = Object.freeze({
  Failure: 0,
  Validation: 1,
  NotFound: 2,
  Conflict: 3,
  Unauthorized: 4,
  Forbidden: 5,
});
