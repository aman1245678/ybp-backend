-- AlterTable users already has passwordHash

-- CreateEnum
CREATE TYPE "FormTypeCode" AS ENUM (
  'BRANDING',
  'CASTING_CREW',
  'IT_SOLUTIONS',
  'TRAINING',
  'DIGITAL_MARKETING',
  'SOCIAL_MEDIA',
  'MANPOWER_HIRE',
  'CREATIVE_CAREER',
  'FILM_TV_TALENT',
  'IT_CAREER',
  'OFFICE_JOB'
);

CREATE TYPE "UserKind" AS ENUM ('INDUSTRY', 'CANDIDATE');

CREATE TYPE "SubmissionSource" AS ENUM ('MOBILE', 'WEBSITE', 'ADMIN');

CREATE TYPE "FormSubmissionStatus" AS ENUM (
  'Received',
  'UnderReview',
  'Contacted',
  'InProgress',
  'Closed',
  'Rejected'
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" UUID NOT NULL,
    "applicationId" TEXT NOT NULL,
    "formType" "FormTypeCode" NOT NULL,
    "typeCode" TEXT NOT NULL,
    "userKind" "UserKind" NOT NULL,
    "source" "SubmissionSource" NOT NULL DEFAULT 'MOBILE',
    "status" "FormSubmissionStatus" NOT NULL DEFAULT 'Received',
    "userId" UUID,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactMobile" TEXT,
    "contactWhatsapp" TEXT,
    "companyName" TEXT,
    "payload" JSONB NOT NULL,
    "preferredCommunication" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAtUtc" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAtUtc" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAtUtc" TIMESTAMPTZ(3),

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "form_submissions_applicationId_key" ON "form_submissions"("applicationId");
CREATE INDEX "form_submissions_formType_idx" ON "form_submissions"("formType");
CREATE INDEX "form_submissions_userKind_idx" ON "form_submissions"("userKind");
CREATE INDEX "form_submissions_status_idx" ON "form_submissions"("status");
CREATE INDEX "form_submissions_contactEmail_idx" ON "form_submissions"("contactEmail");
CREATE INDEX "form_submissions_userId_idx" ON "form_submissions"("userId");
CREATE INDEX "form_submissions_createdAtUtc_idx" ON "form_submissions"("createdAtUtc");

ALTER TABLE "form_submissions"
  ADD CONSTRAINT "form_submissions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "application_counters" (
    "id" UUID NOT NULL,
    "typeCode" TEXT NOT NULL,
    "dateYmd" TEXT NOT NULL,
    "lastSeq" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "application_counters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "application_counters_typeCode_dateYmd_key"
  ON "application_counters"("typeCode", "dateYmd");
