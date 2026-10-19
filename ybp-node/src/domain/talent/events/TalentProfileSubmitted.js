import { DomainEvent } from '../../common/events/DomainEvent.js';

export class TalentProfileSubmitted extends DomainEvent {
  /**
   * @param {string} talentProfileId
   * @param {string} category
   * @param {string} fullName
   * @param {string} email
   * @param {string} mobile
   * @param {{ occurredOnUtc?: Date }} [options]
   */
  constructor(talentProfileId, category, fullName, email, mobile, options = {}) {
    super();
    this.talentProfileId = talentProfileId;
    this.category = category;
    this.fullName = fullName;
    this.email = email;
    this.mobile = mobile;
    if (options.occurredOnUtc != null) this.occurredOnUtc = options.occurredOnUtc;
  }
}
