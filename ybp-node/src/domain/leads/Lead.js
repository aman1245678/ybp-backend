import { randomUUID } from 'node:crypto';
import { AuditableAggregateRoot } from '../common/base/AuditableAggregateRoot.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { InquiryType, LeadStatus } from '../common/enums/index.js';
import { InquirySubmitted, LeadCreated } from './events/LeadEvents.js';

export class Lead extends AuditableAggregateRoot {
  constructor(id = randomUUID()) {
    super(id);
    this.type = null;
    this.source = null;
    this.label = '';
    this.name = null;
    this.email = null;
    this.mobile = null;
    this.service = null;
    this.requirement = null;
    this.extraJson = null;
    this.status = LeadStatus.New;
    this.linkedApplicationId = null;
  }

  /**
   * @param {string} type
   * @param {string} source
   * @param {string} label
   * @param {import('../common/valueObjects/PersonName.js').PersonName} name
   * @param {Date} utcNow
   * @param {import('../common/valueObjects/EmailAddress.js').EmailAddress|null} [email]
   * @param {import('../common/valueObjects/MobileNumber.js').MobileNumber|null} [mobile]
   * @param {string|null} [service]
   * @param {string|null} [requirement]
   * @param {string|null} [extraJson]
   */
  static create(
    type,
    source,
    label,
    name,
    utcNow,
    email = null,
    mobile = null,
    service = null,
    requirement = null,
    extraJson = null,
  ) {
    const lead = new Lead(randomUUID());
    lead.type = type;
    lead.source = source;
    lead.label = DomainGuard.notNullOrWhiteSpace(label);
    lead.name = DomainGuard.notNull(name);
    lead.email = email;
    lead.mobile = mobile;
    lead.service = DomainGuard.maxLength(service, 200);
    lead.requirement = DomainGuard.maxLength(requirement, 2000);
    lead.extraJson = extraJson;
    lead.status = LeadStatus.New;

    const createdEvent = new LeadCreated(lead.id, type, source);
    createdEvent.occurredOnUtc = utcNow;
    lead.raiseDomainEvent(createdEvent);

    if (
      type === InquiryType.Contact ||
      type === InquiryType.Collaboration ||
      type === InquiryType.Consultation
    ) {
      const inquiryEvent = new InquirySubmitted(lead.id, type, email?.value ?? null, mobile?.value ?? null);
      inquiryEvent.occurredOnUtc = utcNow;
      lead.raiseDomainEvent(inquiryEvent);
    }

    return lead;
  }

  /** @param {string} applicationId @param {Date} utcNow */
  linkApplication(applicationId, utcNow) {
    this.linkedApplicationId = applicationId;
    this.markUpdated(utcNow);
  }

  /** @param {string} status @param {Date} utcNow */
  changeStatus(status, utcNow) {
    DomainGuard.requires(this.status !== LeadStatus.Closed, 'A closed lead cannot change status.');
    this.status = status;
    this.markUpdated(utcNow);
  }

  /** @param {Date} utcNow */
  convert(utcNow) {
    this.changeStatus(LeadStatus.Converted, utcNow);
  }

  /** @param {Date} utcNow */
  close(utcNow) {
    if (this.status === LeadStatus.Closed) return;
    this.status = LeadStatus.Closed;
    this.markUpdated(utcNow);
  }
}
