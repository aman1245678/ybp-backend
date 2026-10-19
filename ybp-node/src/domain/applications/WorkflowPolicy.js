import { ApplicationStatus, WorkflowTrack } from '../common/enums/index.js';
import { InvalidStatusTransitionException } from '../common/exceptions/DomainException.js';

/** @param {Record<string, number>} enumObj @param {number} value */
function enumName(enumObj, value) {
  return Object.keys(enumObj).find((key) => enumObj[key] === value) ?? String(value);
}

/** @type {Readonly<Record<string, readonly string[]>>} */
const flows = Object.freeze({
  [WorkflowTrack.Talent]: Object.freeze([
    ApplicationStatus.Submitted,
    ApplicationStatus.UnderReview,
    ApplicationStatus.ProfileEvaluated,
    ApplicationStatus.TalentPool,
    ApplicationStatus.AssignmentOffered,
  ]),
  [WorkflowTrack.Casting]: Object.freeze([
    ApplicationStatus.Submitted,
    ApplicationStatus.UnderReview,
    ApplicationStatus.AuditionRequested,
    ApplicationStatus.Shortlisted,
    ApplicationStatus.Selected,
  ]),
  [WorkflowTrack.Media]: Object.freeze([
    ApplicationStatus.Submitted,
    ApplicationStatus.UnderReview,
    ApplicationStatus.ProfileEvaluated,
    ApplicationStatus.Shortlisted,
    ApplicationStatus.AssignmentOffered,
  ]),
  [WorkflowTrack.Manpower]: Object.freeze([
    ApplicationStatus.Submitted,
    ApplicationStatus.UnderReview,
    ApplicationStatus.ProfileEvaluated,
    ApplicationStatus.InterviewScheduled,
    ApplicationStatus.Selected,
  ]),
});

export class WorkflowPolicy {
  /** @param {string} track */
  static flow(track) {
    return flows[track];
  }

  /** @param {string} status */
  static isTerminal(status) {
    return status === ApplicationStatus.Selected || status === ApplicationStatus.Rejected;
  }

  /** @param {string} track @param {string} from */
  static nextStatuses(track, from) {
    if (WorkflowPolicy.isTerminal(from)) return [];

    const flow = flows[track];
    const next = [];
    const index = flow.indexOf(from);

    if (index >= 0 && index < flow.length - 1) {
      next.push(flow[index + 1]);
    }

    next.push(ApplicationStatus.Rejected);
    return next;
  }

  /** @param {string} track @param {string} from @param {string} to */
  static canTransition(track, from, to) {
    return WorkflowPolicy.nextStatuses(track, from).includes(to);
  }

  /** @param {string} track @param {string} from @param {string} to */
  static ensureCanTransition(track, from, to) {
    if (!WorkflowPolicy.canTransition(track, from, to)) {
      throw new InvalidStatusTransitionException(
        `Cannot transition a ${enumName(WorkflowTrack, track)} application from ${enumName(ApplicationStatus, from)} to ${enumName(ApplicationStatus, to)}.`,
      );
    }
  }
}
