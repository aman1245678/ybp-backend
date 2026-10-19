import { randomUUID } from 'node:crypto';
import { ApplicationAggregateRoot } from '../applications/ApplicationAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { WorkflowTrack } from '../common/enums/index.js';
import { TagList } from '../common/valueObjects/TagList.js';
import { MediaProfessionalSubmitted } from './events/MediaProfessionalSubmitted.js';

export class MediaProfessional extends ApplicationAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.name = null;
    this.profession = '';
    this.email = null;
    this.mobile = null;
    this.location = null;
    this.experienceLevel = '';
    this.skills = TagList.Empty;
    this.software = TagList.Empty;
    this.portfolioLinks = TagList.Empty;
    this.compensationExpectation = null;
    this.engagementModel = '';
    this.availability = TagList.Empty;
    this.about = null;
  }

  get track() {
    return WorkflowTrack.Media;
  }

  /**
   * @param {import('../common/valueObjects/PersonName.js').PersonName} name
   * @param {string|null} profession
   * @param {import('../common/valueObjects/EmailAddress.js').EmailAddress} email
   * @param {import('../common/valueObjects/MobileNumber.js').MobileNumber} mobile
   * @param {string|null} experienceLevel
   * @param {Iterable<string>|null} skills
   * @param {import('../common/valueObjects/CompensationBand.js').CompensationBand} compensationExpectation
   * @param {string|null} engagementModel
   * @param {Date} utcNow
   * @param {import('../common/valueObjects/Location.js').Location|null} [location]
   * @param {Iterable<string>|null} [software]
   * @param {Iterable<string>|null} [portfolioLinks]
   * @param {Iterable<string>|null} [availability]
   * @param {string|null} [about]
   * @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} [emailVerification]
   * @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} [mobileVerification]
   */
  static create(
    name,
    profession,
    email,
    mobile,
    experienceLevel,
    skills,
    compensationExpectation,
    engagementModel,
    utcNow,
    location = null,
    software = null,
    portfolioLinks = null,
    availability = null,
    about = null,
    emailVerification = null,
    mobileVerification = null,
  ) {
    const skillTags = TagList.Create(skills, 25);
    DomainGuard.requires(!skillTags.isEmpty, 'At least one skill is required.');

    const pro = new MediaProfessional(randomUUID());
    pro.name = DomainGuard.notNull(name);
    pro.profession = DomainGuard.notNullOrWhiteSpace(profession);
    pro.email = DomainGuard.notNull(email);
    pro.mobile = DomainGuard.notNull(mobile);
    pro.experienceLevel = DomainGuard.notNullOrWhiteSpace(experienceLevel);
    pro.skills = skillTags;
    pro.compensationExpectation = DomainGuard.notNull(compensationExpectation);
    pro.engagementModel = DomainGuard.notNullOrWhiteSpace(engagementModel);
    pro.location = location;
    pro.software = TagList.Create(software);
    pro.portfolioLinks = TagList.Create(portfolioLinks);
    pro.availability = TagList.Create(availability);
    pro.about = DomainGuard.maxLength(about, 2000);

    pro.setVerification(emailVerification, mobileVerification);
    pro.initializeSubmission(utcNow);

    const event = new MediaProfessionalSubmitted(
      pro.id,
      pro.profession,
      name.fullName,
      email.value,
      mobile.value,
    );
    event.occurredOnUtc = utcNow;
    pro.raiseDomainEvent(event);

    return pro;
  }
}
