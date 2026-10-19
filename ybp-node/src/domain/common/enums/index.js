export const WorkMode = Object.freeze({
  Onsite: 0,
  Remote: 1,
  Hybrid: 2,
});

export const Gender = Object.freeze({
  Unspecified: 0,
  Female: 1,
  Male: 2,
  NonBinary: 3,
  Other: 4,
});

export const CompanySize = Object.freeze({
  Unspecified: 0,
  Size1To10: 1,
  Size11To50: 2,
  Size51To200: 3,
  Size201To500: 4,
  Size500Plus: 5,
});

export const ApplicationStatus = Object.freeze({
  Submitted: 0,
  UnderReview: 1,
  ProfileEvaluated: 2,
  Shortlisted: 3,
  InterviewScheduled: 4,
  AuditionRequested: 5,
  Selected: 6,
  TalentPool: 7,
  AssignmentOffered: 8,
  Rejected: 9,
});

export const WorkflowTrack = Object.freeze({
  Talent: 0,
  Casting: 1,
  Media: 2,
  Manpower: 3,
});

export const AuditAction = Object.freeze({
  Create: 0,
  Update: 1,
  SoftDelete: 2,
  Restore: 3,
  StatusChange: 4,
  Login: 5,
  IssueCredentials: 6,
});

export const TrainingLevel = Object.freeze({
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
});

export const FileKind = Object.freeze({
  Unknown: 0,
  Pdf: 1,
  Docx: 2,
  Jpg: 3,
  Png: 4,
  Zip: 5,
  Mp4: 6,
});

export const UploadStatus = Object.freeze({
  Pending: 0,
  Uploading: 1,
  Uploaded: 2,
  Error: 3,
});

export const ScanStatus = Object.freeze({
  Pending: 0,
  Clean: 1,
  Infected: 2,
  Skipped: 3,
});

export const DocumentOwnerType = Object.freeze({
  Unassigned: 0,
  TalentProfile: 1,
  CastingApplication: 2,
  MediaProfessional: 3,
  OutsourcingRequirement: 4,
  Cms: 5,
});

export const DocumentPurpose = Object.freeze({
  Attachment: 0,
  TalentResume: 1,
  TalentAttachment: 2,
  CastingPortfolio: 3,
  MediaWorkSample: 4,
  ManpowerAttachment: 5,
  CmsAsset: 6,
});

export const UserStatus = Object.freeze({
  Active: 0,
  Invited: 1,
  Suspended: 2,
  Deactivated: 3,
});

export const RoleType = Object.freeze({
  Admin: 0,
  HR: 1,
  Recruiter: 2,
  Talent: 3,
  MediaProfessional: 4,
  Client: 5,
  Trainer: 6,
});

export const RegistrationRequestStatus = Object.freeze({
  Requested: 0,
  Approved: 1,
  Issued: 2,
  Rejected: 3,
});

export const SignupCategory = Object.freeze({
  Actor: 0,
  OtherMediaProfessional: 1,
  TalentPoolSeeker: 2,
  CorporateManpower: 3,
  IndustryJobSeeker: 4,
  CorporateTraining: 5,
});

export const InquiryType = Object.freeze({
  Contact: 0,
  Consultation: 1,
  Collaboration: 2,
  TalentRegistration: 3,
  ManpowerRequirement: 4,
});

export const LeadStatus = Object.freeze({
  New: 0,
  Triaged: 1,
  Contacted: 2,
  Qualified: 3,
  Converted: 4,
  Closed: 5,
});

export const LeadSource = Object.freeze({
  ContactForm: 0,
  CollaborationForm: 1,
  TalentPortal: 2,
  CastingPortal: 3,
  MediaPortal: 4,
  ManpowerPortal: 5,
});

export const SmsProvider = Object.freeze({
  Twilio: 0,
  Msg91: 1,
  Fast2Sms: 2,
});

export const NotificationChannel = Object.freeze({
  Sms: 0,
  Email: 1,
  Crm: 2,
  WhatsApp: 3,
  Push: 4,
});

export const NotificationStatus = Object.freeze({
  Queued: 0,
  Sent: 1,
  Failed: 2,
  Skipped: 3,
});

export const OtpChannel = Object.freeze({
  Email: 0,
  Mobile: 1,
});

export const OtpPurpose = Object.freeze({
  ContactForm: 0,
  CollaborationForm: 1,
  TalentRegistration: 2,
  CastingApplication: 3,
  MediaRegistration: 4,
  ManpowerRequirement: 5,
  AccountVerification: 6,
});

export const VerificationOutcome = Object.freeze({
  Success: 0,
  InvalidCode: 1,
  Expired: 2,
  TooManyAttempts: 3,
  AlreadyConsumed: 4,
});
