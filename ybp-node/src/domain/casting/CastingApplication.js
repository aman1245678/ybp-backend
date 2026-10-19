import { randomUUID } from 'node:crypto';
import { ApplicationAggregateRoot } from '../applications/ApplicationAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { DomainException } from '../common/exceptions/DomainException.js';
import { Gender, WorkflowTrack } from '../common/enums/index.js';
import { PhysicalProfile } from '../common/valueObjects/PhysicalProfile.js';
import { TagList } from '../common/valueObjects/TagList.js';
import { CastingApplicationSubmitted } from './events/CastingApplicationSubmitted.js';

export class CastingApplication extends ApplicationAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.name = null;
    this.email = null;
    this.mobile = null;
    this.dateOfBirth = null;
    this.gender = Gender.Unspecified;
    this.location = null;
    this.physical = PhysicalProfile.Empty;
    this.experienceLevel = '';
    this.yearsActive = null;
    this.credits = null;
    this.languages = TagList.Empty;
    this.skills = TagList.Empty;
    this.mediaLinks = TagList.Empty;
    this.availability = TagList.Empty;
    this.willingToTravel = false;
  }

  get track() {
    return WorkflowTrack.Casting;
  }

  /**
   * @param {import('../common/valueObjects/PersonName.js').PersonName} name
   * @param {import('../common/valueObjects/EmailAddress.js').EmailAddress} email
   * @param {import('../common/valueObjects/MobileNumber.js').MobileNumber} mobile
   * @param {string|null} experienceLevel
   * @param {Date} utcNow
   * @param {Date|null} [dateOfBirth]
   * @param {string} [gender]
   * @param {import('../common/valueObjects/Location.js').Location|null} [location]
   * @param {PhysicalProfile|null} [physical]
   * @param {number|null} [yearsActive]
   * @param {string|null} [credits]
   * @param {Iterable<string>|null} [languages]
   * @param {Iterable<string>|null} [skills]
   * @param {Iterable<string>|null} [mediaLinks]
   * @param {Iterable<string>|null} [availability]
   * @param {boolean} [willingToTravel]
   * @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} [emailVerification]
   * @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} [mobileVerification]
   */
  static create(
    name,
    email,
    mobile,
    experienceLevel,
    utcNow,
    dateOfBirth = null,
    gender = Gender.Unspecified,
    location = null,
    physical = null,
    yearsActive = null,
    credits = null,
    languages = null,
    skills = null,
    mediaLinks = null,
    availability = null,
    willingToTravel = false,
    emailVerification = null,
    mobileVerification = null,
  ) {
    if (yearsActive != null && yearsActive < 0) {
      throw new DomainException('Years active cannot be negative.');
    }

    const app = new CastingApplication(randomUUID());
    app.name = DomainGuard.notNull(name);
    app.email = DomainGuard.notNull(email);
    app.mobile = DomainGuard.notNull(mobile);
    app.experienceLevel = DomainGuard.notNullOrWhiteSpace(experienceLevel);
    app.dateOfBirth = dateOfBirth;
    app.gender = gender;
    app.location = location;
    app.physical = physical ?? PhysicalProfile.Empty;
    app.yearsActive = yearsActive;
    app.credits = DomainGuard.maxLength(credits, 2000);
    app.languages = TagList.Create(languages);
    app.skills = TagList.Create(skills, 25);
    app.mediaLinks = TagList.Create(mediaLinks);
    app.availability = TagList.Create(availability);
    app.willingToTravel = willingToTravel;

    app.setVerification(emailVerification, mobileVerification);
    app.initializeSubmission(utcNow);

    const event = new CastingApplicationSubmitted(app.id, name.fullName, email.value, mobile.value);
    event.occurredOnUtc = utcNow;
    app.raiseDomainEvent(event);

    return app;
  }
}
