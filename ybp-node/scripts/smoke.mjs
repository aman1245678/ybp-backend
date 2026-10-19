import { PersonName } from '../src/domain/common/valueObjects/PersonName.js';
import { EmailAddress } from '../src/domain/common/valueObjects/EmailAddress.js';
import { MobileNumber } from '../src/domain/common/valueObjects/MobileNumber.js';
import { TalentProfile } from '../src/domain/talent/TalentProfile.js';
import { WorkflowPolicy } from '../src/domain/applications/WorkflowPolicy.js';
import { ApplicationStatus, WorkflowTrack } from '../src/domain/common/enums/index.js';
import { createApp } from '../src/app.js';

const now = new Date();
const t = TalentProfile.create(
  'actor',
  PersonName.Create('Aman Kumar'),
  EmailAddress.Create('aman@test.com'),
  MobileNumber.Create('9876543210'),
  'mid',
  now,
);

console.log('talent', t.id, t.status, t.track, t.domainEvents.length, t.history[0]?.note);
t.advanceStatus(ApplicationStatus.UnderReview, now);
console.log('advanced', t.status);
console.log(
  'canTransition',
  WorkflowPolicy.canTransition(WorkflowTrack.Talent, ApplicationStatus.UnderReview, ApplicationStatus.ProfileEvaluated),
);

const app = createApp();
const server = app.listen(0, async () => {
  const { port } = server.address();
  const ping = await fetch(`http://127.0.0.1:${port}/api/v1/ping`);
  const health = await fetch(`http://127.0.0.1:${port}/health`);
  console.log('ping', ping.status, await ping.json());
  console.log('health', health.status, await health.json());
  server.close();
  console.log('OK');
});
