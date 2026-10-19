-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('Submitted', 'UnderReview', 'ProfileEvaluated', 'Shortlisted', 'InterviewScheduled', 'AuditionRequested', 'Selected', 'TalentPool', 'AssignmentOffered', 'Rejected');

-- CreateEnum
CREATE TYPE "WorkflowTrack" AS ENUM ('Talent', 'Casting', 'Media', 'Manpower');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Invited', 'Suspended', 'Deactivated');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('Admin', 'HR', 'Recruiter', 'Talent', 'MediaProfessional', 'Client', 'Trainer');

-- CreateEnum
CREATE TYPE "RegistrationRequestStatus" AS ENUM ('Requested', 'Approved', 'Issued', 'Rejected');

-- CreateEnum
CREATE TYPE "SignupCategory" AS ENUM ('Actor', 'OtherMediaProfessional', 'TalentPoolSeeker', 'CorporateManpower', 'IndustryJobSeeker', 'CorporateTraining');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('Onsite', 'Remote', 'Hybrid');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Unspecified', 'Female', 'Male', 'NonBinary', 'Other');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('Unspecified', 'Size1To10', 'Size11To50', 'Size51To200', 'Size201To500', 'Size500Plus');

-- CreateEnum
CREATE TYPE "FileKind" AS ENUM ('Unknown', 'Pdf', 'Docx', 'Jpg', 'Png', 'Zip', 'Mp4');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('Pending', 'Uploading', 'Uploaded', 'Error');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('Pending', 'Clean', 'Infected', 'Skipped');

-- CreateEnum
CREATE TYPE "DocumentOwnerType" AS ENUM ('Unassigned', 'TalentProfile', 'CastingApplication', 'MediaProfessional', 'OutsourcingRequirement', 'Cms');

-- CreateEnum
CREATE TYPE "DocumentPurpose" AS ENUM ('Attachment', 'TalentResume', 'TalentAttachment', 'CastingPortfolio', 'MediaWorkSample', 'ManpowerAttachment', 'CmsAsset');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('Contact', 'Consultation', 'Collaboration', 'TalentRegistration', 'ManpowerRequirement');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('New', 'Triaged', 'Contacted', 'Qualified', 'Converted', 'Closed');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('ContactForm', 'CollaborationForm', 'TalentPortal', 'CastingPortal', 'MediaPortal', 'ManpowerPortal');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('Sms', 'Email', 'Crm', 'WhatsApp', 'Push');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('Queued', 'Sent', 'Failed', 'Skipped');

-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('Email', 'Mobile');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('ContactForm', 'CollaborationForm', 'TalentRegistration', 'CastingApplication', 'MediaRegistration', 'ManpowerRequirement', 'AccountVerification');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('Create', 'Update', 'SoftDelete', 'Restore', 'StatusChange', 'Login', 'IssueCredentials');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "passwordHash" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'Invited',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isMobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "roles" "RoleType"[] DEFAULT ARRAY[]::"RoleType"[],
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAtUtc" TIMESTAMPTZ(3) NOT NULL,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAtUtc" TIMESTAMPTZ(3),
    "replacedByToken" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "type" "RoleType" NOT NULL,
    "name" TEXT NOT NULL,
    "permissionCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_requests" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" "SignupCategory" NOT NULL,
    "description" TEXT,
    "status" "RegistrationRequestStatus" NOT NULL DEFAULT 'Requested',
    "issuedUserId" UUID,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "registration_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "type" "InquiryType" NOT NULL,
    "source" "LeadSource" NOT NULL,
    "label" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "service" TEXT,
    "requirement" TEXT,
    "extraJson" JSONB,
    "status" "LeadStatus" NOT NULL DEFAULT 'New',
    "linkedApplicationId" UUID,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_status_events" (
    "id" UUID NOT NULL,
    "track" "WorkflowTrack" NOT NULL,
    "applicationId" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "atUtc" TIMESTAMPTZ(3) NOT NULL,
    "note" TEXT,
    "byUserId" UUID,

    CONSTRAINT "application_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_profiles" (
    "id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Submitted',
    "category" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "locationCity" TEXT,
    "experienceLevel" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "portfolioLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "about" TEXT,
    "emailVerification" JSONB,
    "mobileVerification" JSONB,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "talent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casting_applications" (
    "id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Submitted',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "dateOfBirth" DATE,
    "gender" "Gender" NOT NULL DEFAULT 'Unspecified',
    "locationCity" TEXT,
    "heightCm" INTEGER,
    "weightKg" INTEGER,
    "complexion" TEXT,
    "hairColor" TEXT,
    "eyeColor" TEXT,
    "measurements" TEXT,
    "experienceLevel" TEXT NOT NULL,
    "yearsActive" INTEGER,
    "credits" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "willingToTravel" BOOLEAN NOT NULL DEFAULT false,
    "emailVerification" JSONB,
    "mobileVerification" JSONB,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "casting_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_professionals" (
    "id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Submitted',
    "fullName" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "locationCity" TEXT,
    "experienceLevel" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "software" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "portfolioLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compensationSlug" TEXT NOT NULL,
    "compensationLabel" TEXT,
    "engagementModel" TEXT NOT NULL,
    "availability" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "about" TEXT,
    "emailVerification" JSONB,
    "mobileVerification" JSONB,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "media_professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outsourcing_requirements" (
    "id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Submitted',
    "organizationName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "website" TEXT,
    "companySize" "CompanySize" NOT NULL DEFAULT 'Unspecified',
    "totalHeadcount" INTEGER NOT NULL DEFAULT 0,
    "locationCity" TEXT,
    "workMode" "WorkMode",
    "startDate" DATE,
    "duration" TEXT,
    "budgetSlug" TEXT NOT NULL,
    "budgetLabel" TEXT,
    "compensationNotes" TEXT,
    "requirement" TEXT,
    "emailVerification" JSONB,
    "mobileVerification" JSONB,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "outsourcing_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workforce_roles" (
    "id" UUID NOT NULL,
    "requirementId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceLevel" TEXT,

    CONSTRAINT "workforce_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileKind" "FileKind" NOT NULL DEFAULT 'Unknown',
    "sizeBytes" BIGINT NOT NULL DEFAULT 0,
    "purpose" "DocumentPurpose" NOT NULL,
    "ownerType" "DocumentOwnerType" NOT NULL DEFAULT 'Unassigned',
    "ownerId" UUID,
    "storageKey" TEXT,
    "url" TEXT,
    "uploadStatus" "UploadStatus" NOT NULL DEFAULT 'Pending',
    "scanStatus" "ScanStatus" NOT NULL DEFAULT 'Pending',
    "error" TEXT,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" UUID NOT NULL,
    "verificationId" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "destinationHash" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAtUtc" TIMESTAMPTZ(3) NOT NULL,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "verifyAttempts" INTEGER NOT NULL DEFAULT 0,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "maxVerifyAttempts" INTEGER NOT NULL,
    "maxResendAttempts" INTEGER NOT NULL,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "provider" TEXT,
    "recipient" TEXT NOT NULL,
    "tag" TEXT,
    "templateKey" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'Queued',
    "providerMessageId" TEXT,
    "error" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "relatedType" TEXT,
    "relatedId" UUID,
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),
    "deletedBy" TEXT,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID,
    "performedByUserId" UUID,
    "detail" TEXT,
    "occurredAtUtc" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_isDeleted_idx" ON "users"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_type_key" ON "roles"("type");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "registration_requests_email_idx" ON "registration_requests"("email");

-- CreateIndex
CREATE INDEX "registration_requests_status_idx" ON "registration_requests"("status");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_type_idx" ON "leads"("type");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "leads_linkedApplicationId_idx" ON "leads"("linkedApplicationId");

-- CreateIndex
CREATE INDEX "application_status_events_track_applicationId_idx" ON "application_status_events"("track", "applicationId");

-- CreateIndex
CREATE INDEX "application_status_events_atUtc_idx" ON "application_status_events"("atUtc");

-- CreateIndex
CREATE INDEX "talent_profiles_status_idx" ON "talent_profiles"("status");

-- CreateIndex
CREATE INDEX "talent_profiles_email_idx" ON "talent_profiles"("email");

-- CreateIndex
CREATE INDEX "talent_profiles_category_idx" ON "talent_profiles"("category");

-- CreateIndex
CREATE INDEX "casting_applications_status_idx" ON "casting_applications"("status");

-- CreateIndex
CREATE INDEX "casting_applications_email_idx" ON "casting_applications"("email");

-- CreateIndex
CREATE INDEX "media_professionals_status_idx" ON "media_professionals"("status");

-- CreateIndex
CREATE INDEX "media_professionals_email_idx" ON "media_professionals"("email");

-- CreateIndex
CREATE INDEX "outsourcing_requirements_status_idx" ON "outsourcing_requirements"("status");

-- CreateIndex
CREATE INDEX "outsourcing_requirements_email_idx" ON "outsourcing_requirements"("email");

-- CreateIndex
CREATE INDEX "workforce_roles_requirementId_idx" ON "workforce_roles"("requirementId");

-- CreateIndex
CREATE INDEX "documents_ownerType_ownerId_idx" ON "documents"("ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "documents_uploadStatus_idx" ON "documents"("uploadStatus");

-- CreateIndex
CREATE UNIQUE INDEX "verification_requests_verificationId_key" ON "verification_requests"("verificationId");

-- CreateIndex
CREATE INDEX "verification_requests_expiresAtUtc_idx" ON "verification_requests"("expiresAtUtc");

-- CreateIndex
CREATE INDEX "verification_requests_purpose_channel_idx" ON "verification_requests"("purpose", "channel");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_idx" ON "notification_deliveries"("status");

-- CreateIndex
CREATE INDEX "notification_deliveries_relatedType_relatedId_idx" ON "notification_deliveries"("relatedType", "relatedId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_occurredAtUtc_idx" ON "audit_logs"("occurredAtUtc");

-- CreateIndex
CREATE INDEX "audit_logs_performedByUserId_idx" ON "audit_logs"("performedByUserId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_roles" ADD CONSTRAINT "workforce_roles_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "outsourcing_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
