import { DomainEvent } from '../../common/events/DomainEvent.js';

export class LeadCreated extends DomainEvent {
  /** @param {string} leadId @param {string} type @param {string} source */
  constructor(leadId, type, source) {
    super();
    this.leadId = leadId;
    this.type = type;
    this.source = source;
  }
}

export class InquirySubmitted extends DomainEvent {
  /**
   * @param {string} leadId
   * @param {string} type
   * @param {string|null} email
   * @param {string|null} mobile
   */
  constructor(leadId, type, email, mobile) {
    super();
    this.leadId = leadId;
    this.type = type;
    this.email = email;
    this.mobile = mobile;
  }
}
