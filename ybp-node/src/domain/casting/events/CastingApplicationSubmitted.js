import { DomainEvent } from '../../common/events/DomainEvent.js';

export class CastingApplicationSubmitted extends DomainEvent {
  /**
   * @param {string} castingApplicationId
   * @param {string} fullName
   * @param {string} email
   * @param {string} mobile
   */
  constructor(castingApplicationId, fullName, email, mobile) {
    super();
    this.castingApplicationId = castingApplicationId;
    this.fullName = fullName;
    this.email = email;
    this.mobile = mobile;
  }
}
