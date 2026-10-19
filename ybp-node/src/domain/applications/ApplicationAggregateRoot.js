import { randomUUID } from 'node:crypto';
import { AuditableAggregateRoot } from '../common/base/AuditableAggregateRoot.js';
import { ApplicationStatus, WorkflowTrack } from '../common/enums/index.js';
import { ApplicationStatusAdvanced } from './events/ApplicationStatusAdvanced.js';
import { StatusEvent } from './StatusEvent.js';
import { WorkflowPolicy } from './WorkflowPolicy.js';

export class ApplicationAggregateRoot extends AuditableAggregateRoot {
  /** @param {string} [id] */
  constructor(id = randomUUID()) {
    super(id);
    /** @type {StatusEvent[]} */
    this._history = [];
    this.status = ApplicationStatus.Submitted;
    this.emailVerification = null;
    this.mobileVerification = null;
  }

  /** @type {readonly StatusEvent[]} */
  get history() {
    return Object.freeze([...this._history]);
  }

  get track() {
    throw new Error('Subclasses must override track.');
  }

  /** @param {Date} utcNow */
  initializeSubmission(utcNow) {
    this.status = ApplicationStatus.Submitted;
    this._history.push(
      StatusEvent.create(
        ApplicationStatus.Submitted,
        utcNow,
        `Created via ${Object.keys(WorkflowTrack).find((key) => WorkflowTrack[key] === this.track) ?? this.track} portal`,
      ),
    );
  }

  /** @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} email @param {import('../common/valueObjects/VerificationToken.js').VerificationToken|null} mobile */
  setVerification(email, mobile) {
    this.emailVerification = email;
    this.mobileVerification = mobile;
  }

  /**
   * @param {string} next
   * @param {Date} utcNow
   * @param {string|null} [byUserId]
   * @param {string|null} [note]
   */
  advanceStatus(next, utcNow, byUserId = null, note = null) {
    WorkflowPolicy.ensureCanTransition(this.track, this.status, next);

    const from = this.status;
    this.status = next;
    this._history.push(StatusEvent.create(next, utcNow, note, byUserId));
    this.markUpdated(utcNow, byUserId ?? null);

    const event = new ApplicationStatusAdvanced(this.id, this.track, from, next, byUserId);
    event.occurredOnUtc = utcNow;
    this.raiseDomainEvent(event);
  }
}
