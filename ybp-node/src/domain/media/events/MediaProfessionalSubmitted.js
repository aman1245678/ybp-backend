import { DomainEvent } from '../../common/events/DomainEvent.js';

export class MediaProfessionalSubmitted extends DomainEvent {
  /**
   * @param {string} mediaProfessionalId
   * @param {string} profession
   * @param {string} fullName
   * @param {string} email
   * @param {string} mobile
   */
  constructor(mediaProfessionalId, profession, fullName, email, mobile) {
    super();
    this.mediaProfessionalId = mediaProfessionalId;
    this.profession = profession;
    this.fullName = fullName;
    this.email = email;
    this.mobile = mobile;
  }
}
