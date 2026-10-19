import { DomainEvent } from '../../common/events/DomainEvent.js';

export class OutsourcingRequirementSubmitted extends DomainEvent {
  /**
   * @param {string} outsourcingRequirementId
   * @param {string} organizationName
   * @param {string} contactPerson
   * @param {string} email
   * @param {string} mobile
   * @param {number} totalHeadcount
   */
  constructor(outsourcingRequirementId, organizationName, contactPerson, email, mobile, totalHeadcount) {
    super();
    this.outsourcingRequirementId = outsourcingRequirementId;
    this.organizationName = organizationName;
    this.contactPerson = contactPerson;
    this.email = email;
    this.mobile = mobile;
    this.totalHeadcount = totalHeadcount;
  }
}
