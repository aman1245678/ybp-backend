import { randomUUID } from 'node:crypto';
import { ApplicationAggregateRoot } from '../applications/ApplicationAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { WorkflowTrack } from '../common/enums/index.js';
import { TagList } from '../common/valueObjects/TagList.js';
import { TalentProfileSubmitted } from './events/TalentProfileSubmitted.js';

export class TalentProfile extends ApplicationAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.category = '';
    this.name = null;
    this.email = null;
    this.mobile = null;
    this.location = null;
    this.experienceLevel = '';
    this.skills = TagList.Empty;
    this.availability = TagList.Empty;
    this.portfolioLinks = TagList.Empty;
    this.about = null;
  }

  get track() {
    return WorkflowTrack.Talent;
  }

  /**
   * @param {string|null} category
   * @param {import('../common/valueObjects/PersonName.js').PersonName} name
   * @param {import('../common/valueObjects/EmailAddress.js').EmailAddress} email
   * @param {import('../common/valueObjects/MobileNumber.js').MobileNumber} mobile
   * @param {string|null} experienceLevel
   * @param {Date} utcNow
   * @param {import('../common/valueObjects/Location.js').Location|null} [location]
   * @param {Iterable<string>|null} [skills]
   * @param {Iterable<string>|null} [availability]
   * @param {Iterable<string>|null} [portfolioLinks]
   * @param {string|null} [about]
   * @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} [emailVerification]
   * @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} [mobileVerification]
   */
  static create(
    category,
    name,
    email,
    mobile,
    experienceLevel,
    utcNow,
    location = null,
    skills = null,
    availability = null,
    portfolioLinks = null,
    about = null,
    emailVerification = null,
    mobileVerification = null,
  ) {
    const profile = new TalentProfile(randomUUID());
    profile.category = DomainGuard.notNullOrWhiteSpace(category);
    profile.name = DomainGuard.notNull(name);
    profile.email = DomainGuard.notNull(email);
    profile.mobile = DomainGuard.notNull(mobile);
    profile.experienceLevel = DomainGuard.notNullOrWhiteSpace(experienceLevel);
    profile.location = location;
    profile.skills = TagList.Create(skills, 25);
    profile.availability = TagList.Create(availability);
    profile.portfolioLinks = TagList.Create(portfolioLinks);
    profile.about = DomainGuard.maxLength(about, 2000);

    profile.setVerification(emailVerification, mobileVerification);
    profile.initializeSubmission(utcNow);

    const event = new TalentProfileSubmitted(
      profile.id,
      profile.category,
      name.fullName,
      email.value,
      mobile.value,
    );
    event.occurredOnUtc = utcNow;
    profile.raiseDomainEvent(event);

    return profile;
  }
}
