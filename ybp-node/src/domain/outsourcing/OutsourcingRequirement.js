import { randomUUID } from 'node:crypto';
import { ApplicationAggregateRoot } from '../applications/ApplicationAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { CompanySize, WorkflowTrack } from '../common/enums/index.js';
import { OutsourcingRequirementSubmitted } from './events/OutsourcingRequirementSubmitted.js';
import { WorkforceRole } from './WorkforceRole.js';

export class OutsourcingRequirement extends ApplicationAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    /** @type {WorkforceRole[]} */
    this._roles = [];
    this.organizationName = '';
    this.industry = '';
    this.contactPerson = '';
    this.email = null;
    this.mobile = null;
    this.website = null;
    this.companySize = CompanySize.Unspecified;
    this.totalHeadcount = 0;
    this.location = null;
    this.workMode = null;
    this.startDate = null;
    this.duration = null;
    this.budgetRange = null;
    this.compensationNotes = null;
    this.requirement = null;
  }

  get track() {
    return WorkflowTrack.Manpower;
  }

  /** @type {readonly WorkforceRole[]} */
  get roles() {
    return Object.freeze([...this._roles]);
  }

  /**
   * @param {string|null} organizationName
   * @param {string|null} industry
   * @param {string|null} contactPerson
   * @param {import('../common/valueObjects/EmailAddress.js').EmailAddress} email
   * @param {import('../common/valueObjects/MobileNumber.js').MobileNumber} mobile
   * @param {import('../common/valueObjects/CompensationBand.js').CompensationBand} budgetRange
   * @param {Iterable<WorkforceRole>} roles
   * @param {Date} utcNow
   * @param {string|null} [website]
   * @param {string} [companySize]
   * @param {import('../common/valueObjects/Location.js').Location|null} [location]
   * @param {string|null} [workMode]
   * @param {Date|null} [startDate]
   * @param {string|null} [duration]
   * @param {string|null} [compensationNotes]
   * @param {string|null} [requirement]
   * @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} [emailVerification]
   * @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} [mobileVerification]
   */
  static create(
    organizationName,
    industry,
    contactPerson,
    email,
    mobile,
    budgetRange,
    roles,
    utcNow,
    website = null,
    companySize = CompanySize.Unspecified,
    location = null,
    workMode = null,
    startDate = null,
    duration = null,
    compensationNotes = null,
    requirement = null,
    emailVerification = null,
    mobileVerification = null,
  ) {
    const roleList = roles ? [...roles] : [];
    DomainGuard.requires(roleList.length >= 1, 'At least one workforce role is required.');

    const req = new OutsourcingRequirement(randomUUID());
    req.organizationName = DomainGuard.notNullOrWhiteSpace(organizationName);
    req.industry = DomainGuard.notNullOrWhiteSpace(industry);
    req.contactPerson = DomainGuard.notNullOrWhiteSpace(contactPerson);
    req.email = DomainGuard.notNull(email);
    req.mobile = DomainGuard.notNull(mobile);
    req.budgetRange = DomainGuard.notNull(budgetRange);
    req.website = DomainGuard.maxLength(website, 500);
    req.companySize = companySize;
    req.location = location;
    req.workMode = workMode;
    req.startDate = startDate;
    req.duration = DomainGuard.maxLength(duration, 200);
    req.compensationNotes = DomainGuard.maxLength(compensationNotes, 2000);
    req.requirement = DomainGuard.maxLength(requirement, 2000);

    req._roles.push(...roleList);
    req.recalculateTotalHeadcount();
    req.setVerification(emailVerification, mobileVerification);
    req.initializeSubmission(utcNow);

    const event = new OutsourcingRequirementSubmitted(
      req.id,
      req.organizationName,
      req.contactPerson,
      email.value,
      mobile.value,
      req.totalHeadcount,
    );
    event.occurredOnUtc = utcNow;
    req.raiseDomainEvent(event);

    return req;
  }

  /** @param {WorkforceRole} role @param {Date} utcNow */
  addRole(role, utcNow) {
    this._roles.push(DomainGuard.notNull(role));
    this.recalculateTotalHeadcount();
    this.markUpdated(utcNow);
  }

  /** @param {string} roleId @param {Date} utcNow */
  removeRole(roleId, utcNow) {
    DomainGuard.requires(this._roles.length > 1, 'At least one workforce role is required.');
    const index = this._roles.findIndex((r) => r.id === roleId);
    if (index === -1) return;
    this._roles.splice(index, 1);
    this.recalculateTotalHeadcount();
    this.markUpdated(utcNow);
  }

  recalculateTotalHeadcount() {
    this.totalHeadcount = this._roles.reduce((sum, role) => sum + role.count, 0);
  }
}
