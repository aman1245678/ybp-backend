import { DomainEvent } from '../../common/events/DomainEvent.js';

export class OtpRequested extends DomainEvent {
  /** @param {string} verificationRequestId @param {string} channel @param {string} purpose */
  constructor(verificationRequestId, channel, purpose) {
    super();
    this.verificationRequestId = verificationRequestId;
    this.channel = channel;
    this.purpose = purpose;
  }
}

export class OtpVerified extends DomainEvent {
  /** @param {string} verificationRequestId @param {string} channel */
  constructor(verificationRequestId, channel) {
    super();
    this.verificationRequestId = verificationRequestId;
    this.channel = channel;
  }
}
