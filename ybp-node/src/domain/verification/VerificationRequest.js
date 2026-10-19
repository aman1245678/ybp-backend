import { randomUUID } from 'node:crypto';
import { AuditableAggregateRoot } from '../common/base/AuditableAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { OtpRequested, OtpVerified } from './events/OtpEvents.js';
import { VerificationOutcome } from '../common/enums/index.js';

export class VerificationRequest extends AuditableAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.verificationId = '';
    this.channel = null;
    this.destinationHash = '';
    this.codeHash = '';
    this.purpose = null;
    this.expiresAtUtc = null;
    this.resendCount = 0;
    this.verifyAttempts = 0;
    this.consumed = false;
    this.maxVerifyAttempts = 0;
    this.maxResendAttempts = 0;
  }

  /**
   * @param {string|null} verificationId
   * @param {string} channel
   * @param {string|null} destinationHash
   * @param {string|null} codeHash
   * @param {string} purpose
   * @param {Date} utcNow
   * @param {number} ttlSeconds
   * @param {number} maxVerifyAttempts
   * @param {number} maxResendAttempts
   */
  static create(
    verificationId,
    channel,
    destinationHash,
    codeHash,
    purpose,
    utcNow,
    ttlSeconds,
    maxVerifyAttempts,
    maxResendAttempts,
  ) {
    DomainGuard.atLeast(ttlSeconds, 1);
    DomainGuard.atLeast(maxVerifyAttempts, 1);
    DomainGuard.requires(maxResendAttempts >= 0, 'Max resend attempts cannot be negative.');

    const request = new VerificationRequest(randomUUID());
    request.verificationId = DomainGuard.notNullOrWhiteSpace(verificationId);
    request.channel = channel;
    request.destinationHash = DomainGuard.notNullOrWhiteSpace(destinationHash);
    request.codeHash = DomainGuard.notNullOrWhiteSpace(codeHash);
    request.purpose = purpose;
    request.expiresAtUtc = new Date(utcNow.getTime() + ttlSeconds * 1000);
    request.maxVerifyAttempts = maxVerifyAttempts;
    request.maxResendAttempts = maxResendAttempts;

    const event = new OtpRequested(request.id, channel, purpose);
    event.occurredOnUtc = utcNow;
    request.raiseDomainEvent(event);

    return request;
  }

  /**
   * @param {string} codeHashCandidate
   * @param {Date} utcNow
   * @returns {string}
   */
  verify(codeHashCandidate, utcNow) {
    if (this.consumed) return VerificationOutcome.AlreadyConsumed;
    if (utcNow > this.expiresAtUtc) return VerificationOutcome.Expired;

    this.verifyAttempts += 1;
    if (this.verifyAttempts > this.maxVerifyAttempts) return VerificationOutcome.TooManyAttempts;

    if (codeHashCandidate !== this.codeHash) return VerificationOutcome.InvalidCode;

    this.consumed = true;
    this.markUpdated(utcNow);

    const event = new OtpVerified(this.id, this.channel);
    event.occurredOnUtc = utcNow;
    this.raiseDomainEvent(event);

    return VerificationOutcome.Success;
  }

  /**
   * @param {string|null} newCodeHash
   * @param {Date} utcNow
   * @param {number} ttlSeconds
   */
  resend(newCodeHash, utcNow, ttlSeconds) {
    DomainGuard.requires(!this.consumed, 'Cannot resend a code that has already been verified.');
    DomainGuard.requires(
      this.resendCount < this.maxResendAttempts,
      'The maximum number of resends has been reached.',
    );
    DomainGuard.atLeast(ttlSeconds, 1);

    this.codeHash = DomainGuard.notNullOrWhiteSpace(newCodeHash);
    this.expiresAtUtc = new Date(utcNow.getTime() + ttlSeconds * 1000);
    this.resendCount += 1;
    this.verifyAttempts = 0;
    this.markUpdated(utcNow);

    const event = new OtpRequested(this.id, this.channel, this.purpose);
    event.occurredOnUtc = utcNow;
    this.raiseDomainEvent(event);
  }

  /** @param {Date} utcNow */
  expire(utcNow) {
    if (utcNow < this.expiresAtUtc) {
      this.expiresAtUtc = utcNow;
    }
    this.markUpdated(utcNow);
  }

  /** @param {Date} utcNow */
  isExpired(utcNow) {
    return utcNow > this.expiresAtUtc;
  }
}
