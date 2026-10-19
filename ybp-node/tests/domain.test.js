import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PersonName } from '../src/domain/common/valueObjects/PersonName.js';
import { EmailAddress } from '../src/domain/common/valueObjects/EmailAddress.js';
import { MobileNumber } from '../src/domain/common/valueObjects/MobileNumber.js';
import { CompensationBand } from '../src/domain/common/valueObjects/CompensationBand.js';
import { TagList } from '../src/domain/common/valueObjects/TagList.js';
import { WorkflowPolicy } from '../src/domain/applications/WorkflowPolicy.js';
import { ApplicationStatus, WorkflowTrack, InquiryType, LeadSource, OtpChannel, OtpPurpose } from '../src/domain/common/enums/index.js';
import { InvalidStatusTransitionException } from '../src/domain/common/exceptions/DomainException.js';
import { TalentProfile } from '../src/domain/talent/TalentProfile.js';
import { Lead } from '../src/domain/leads/Lead.js';
import { VerificationRequest } from '../src/domain/verification/VerificationRequest.js';
import { VerificationOutcome } from '../src/domain/common/enums/index.js';
import { WorkforceRole } from '../src/domain/outsourcing/WorkforceRole.js';
import { OutsourcingRequirement } from '../src/domain/outsourcing/OutsourcingRequirement.js';
import { MediaProfessional } from '../src/domain/media/MediaProfessional.js';

describe('MobileNumber', () => {
  it('normalizes Indian mobiles', () => {
    assert.equal(MobileNumber.Create('+91 98765-43210').value, '9876543210');
    assert.equal(MobileNumber.Normalize('09876543210'), '9876543210');
  });
});

describe('WorkflowPolicy', () => {
  it('allows happy-path and reject', () => {
    assert.deepEqual(
      WorkflowPolicy.nextStatuses(WorkflowTrack.Talent, ApplicationStatus.Submitted),
      [ApplicationStatus.UnderReview, ApplicationStatus.Rejected],
    );
  });

  it('blocks illegal transitions', () => {
    assert.throws(
      () => WorkflowPolicy.ensureCanTransition(WorkflowTrack.Talent, ApplicationStatus.Submitted, ApplicationStatus.Selected),
      InvalidStatusTransitionException,
    );
  });
});

describe('aggregates', () => {
  const now = new Date('2026-01-01T00:00:00Z');

  it('creates talent profile with Submitted status', () => {
    const profile = TalentProfile.create(
      'actor',
      PersonName.Create('Aman Kumar'),
      EmailAddress.Create('aman@example.com'),
      MobileNumber.Create('9876543210'),
      'mid',
      now,
    );
    assert.equal(profile.status, ApplicationStatus.Submitted);
    assert.equal(profile.track, WorkflowTrack.Talent);
    assert.equal(profile.domainEvents.length, 1);
  });

  it('creates lead and inquiry events for contact', () => {
    const lead = Lead.create(
      InquiryType.Contact,
      LeadSource.ContactForm,
      'Contact Form',
      PersonName.Create('Aman Kumar'),
      now,
      EmailAddress.Create('aman@example.com'),
    );
    assert.equal(lead.domainEvents.length, 2);
  });

  it('verifies OTP once', () => {
    const req = VerificationRequest.create(
      'vid-1',
      OtpChannel.Email,
      'dest-hash',
      'code-hash',
      OtpPurpose.ContactForm,
      now,
      300,
      5,
      3,
    );
    assert.equal(req.verify('code-hash', now), VerificationOutcome.Success);
    assert.equal(req.verify('code-hash', now), VerificationOutcome.AlreadyConsumed);
  });

  it('requires skills for media and roles for manpower', () => {
    assert.throws(() => MediaProfessional.create(
      PersonName.Create('Aman Kumar'),
      'Editor',
      EmailAddress.Create('aman@example.com'),
      MobileNumber.Create('9876543210'),
      'mid',
      [],
      CompensationBand.Create('negotiable'),
      'freelance',
      now,
    ));

    const req = OutsourcingRequirement.create(
      'Acme',
      'media',
      'Aman',
      EmailAddress.Create('aman@example.com'),
      MobileNumber.Create('9876543210'),
      CompensationBand.Create('25k-50k'),
      [WorkforceRole.create('Editor', 2, ['premiere'])],
      now,
    );
    assert.equal(req.totalHeadcount, 2);
    assert.ok(TagList.Create(['a']).values.includes('a'));
  });
});
