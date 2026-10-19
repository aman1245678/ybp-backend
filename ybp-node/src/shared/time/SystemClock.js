/** Production clock backed by the real UTC system clock. */
export class SystemClock {
  get utcNow() {
    return new Date();
  }

  get utcNowOffset() {
    return new Date();
  }
}
