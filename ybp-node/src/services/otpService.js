import { randomInt, randomUUID } from 'node:crypto';
import { prisma } from '../persistence/prisma.js';
import { VerificationRequest } from '../domain/verification/VerificationRequest.js';
import {
  OtpChannel,
  OtpPurpose,
  VerificationOutcome,
} from '../domain/common/enums/index.js';
import { hashOtpValue, normalizeDestination } from '../infrastructure/security/otpHashes.js';
import { sendOtpEmail, sendSms } from '../infrastructure/notifications/mailer.js';
import { config } from '../config/index.js';
import { logger } from '../api/logger.js';

const CHANNEL_NAMES = ['Email', 'Mobile'];
const PURPOSE_NAMES = [
  'ContactForm',
  'CollaborationForm',
  'TalentRegistration',
  'CastingApplication',
  'MediaRegistration',
  'ManpowerRequirement',
  'AccountVerification',
];

const PURPOSE_MAP = {
  'contact-form': OtpPurpose.ContactForm,
  'inquiry-form': OtpPurpose.ContactForm,
  'collaboration-form': OtpPurpose.CollaborationForm,
  'casting-application': OtpPurpose.CastingApplication,
  'media-professional': OtpPurpose.MediaRegistration,
  'manpower-requirement': OtpPurpose.ManpowerRequirement,
  'talent-registration': OtpPurpose.TalentRegistration,
  'join-network': OtpPurpose.AccountVerification,
  'auth-register': OtpPurpose.AccountVerification,
  'auth-login': OtpPurpose.AccountVerification,
  signup: OtpPurpose.AccountVerification,
  login: OtpPurpose.AccountVerification,
};

function channelEnum(channel) {
  return channel === 'mobile' || channel === 'Mobile' ? OtpChannel.Mobile : OtpChannel.Email;
}

function channelName(enumVal) {
  return CHANNEL_NAMES[enumVal] ?? 'Email';
}

function purposeEnum(purpose) {
  if (typeof purpose === 'number') return purpose;
  const key = String(purpose ?? '').trim().toLowerCase();
  return PURPOSE_MAP[key] ?? OtpPurpose.ContactForm;
}

function purposeName(enumVal) {
  return PURPOSE_NAMES[enumVal] ?? 'ContactForm';
}

function generateCode() {
  return String(randomInt(0, 10 ** config.otp.codeLength)).padStart(config.otp.codeLength, '0');
}

async function findPending(destinationHash, channelNameVal, purposeNameVal) {
  return prisma.verificationRequest.findFirst({
    where: {
      destinationHash,
      channel: channelNameVal,
      purpose: purposeNameVal,
      consumed: false,
      isDeleted: false,
      expiresAtUtc: { gt: new Date() },
    },
    orderBy: { createdAtUtc: 'desc' },
  });
}

function rowToDomain(row) {
  const req = new VerificationRequest(row.id);
  req.verificationId = row.verificationId;
  req.channel = CHANNEL_NAMES.indexOf(row.channel);
  req.destinationHash = row.destinationHash;
  req.codeHash = row.codeHash;
  req.purpose = PURPOSE_NAMES.indexOf(row.purpose);
  req.expiresAtUtc = row.expiresAtUtc;
  req.resendCount = row.resendCount;
  req.verifyAttempts = row.verifyAttempts;
  req.consumed = row.consumed;
  req.maxVerifyAttempts = row.maxVerifyAttempts;
  req.maxResendAttempts = row.maxResendAttempts;
  return req;
}

async function persistRequest(domainReq) {
  const data = {
    id: domainReq.id,
    verificationId: domainReq.verificationId,
    channel: channelName(domainReq.channel),
    destinationHash: domainReq.destinationHash,
    codeHash: domainReq.codeHash,
    purpose: purposeName(domainReq.purpose),
    expiresAtUtc: domainReq.expiresAtUtc,
    resendCount: domainReq.resendCount,
    verifyAttempts: domainReq.verifyAttempts,
    consumed: domainReq.consumed,
    maxVerifyAttempts: domainReq.maxVerifyAttempts,
    maxResendAttempts: domainReq.maxResendAttempts,
    updatedAtUtc: new Date(),
  };

  const existing = await prisma.verificationRequest.findUnique({ where: { id: domainReq.id } });
  if (existing) {
    await prisma.verificationRequest.update({ where: { id: domainReq.id }, data });
  } else {
    await prisma.verificationRequest.create({ data });
  }
}

async function deliverCode(channel, destination, code, purposeLabel) {
  if (channel === OtpChannel.Email) {
    const result = await sendOtpEmail({ to: destination, code, purposeLabel });
    if (!result.ok) {
      logger.warn('OTP email delivery failed', { to: destination, error: result.error });
    }
    return result;
  }

  await sendSms({
    to: destination,
    message: `YBP verification code: ${code}. Valid for ${Math.floor(config.otp.ttlSeconds / 60)} minutes.`,
    tag: 'otp.mobile',
  });
  return { ok: true };
}

async function assertAuthEmailAllowed(purposeKey, email) {
  if (purposeKey !== 'auth-register' && purposeKey !== 'auth-login') {
    return null;
  }
  const existing = await prisma.user.findFirst({
    where: { email, isDeleted: false },
  });
  if (purposeKey === 'auth-register' && existing) {
    return 'An account with this email already exists. Please log in.';
  }
  if (purposeKey === 'auth-login' && !existing) {
    return 'No account found with this email. Please sign up first.';
  }
  return null;
}

/**
 * @param {{ channel: string, destination: string, purpose?: string }} input
 */
export async function requestOtp(input) {
  const purposeKey = String(input.purpose ?? '').trim().toLowerCase();
  const channel = channelEnum(input.channel);
  const destination = normalizeDestination(input.channel, input.destination);
  if (!destination) {
    return { success: false, error: 'Destination is required.' };
  }

  if (channel === OtpChannel.Email) {
    const authBlock = await assertAuthEmailAllowed(purposeKey, destination);
    if (authBlock) {
      return { success: false, error: authBlock };
    }
  }

  const purpose = purposeEnum(input.purpose);
  const purposeLabel = purposeName(purpose);
  const destinationHash = hashOtpValue(destination);
  const channelDb = channelName(channel);
  const purposeDb = purposeName(purpose);
  const now = new Date();

  let domainReq;
  let plainCode;

  const pending = await findPending(destinationHash, channelDb, purposeDb);
  if (pending) {
    domainReq = rowToDomain(pending);
    plainCode = generateCode();
    try {
      domainReq.resend(hashOtpValue(plainCode), now, config.otp.ttlSeconds);
    } catch (err) {
      return { success: false, error: err.message };
    }
  } else {
    plainCode = generateCode();
    const verificationId = randomUUID();
    domainReq = VerificationRequest.create(
      verificationId,
      channel,
      destinationHash,
      hashOtpValue(plainCode),
      purpose,
      now,
      config.otp.ttlSeconds,
      config.otp.maxVerifyAttempts,
      config.otp.maxResendAttempts,
    );
  }

  await persistRequest(domainReq);
  const delivery = await deliverCode(channel, destination, plainCode, purposeLabel);

  if (channel === OtpChannel.Email && !delivery?.ok) {
    return {
      success: false,
      error:
        delivery?.error ||
        'Could not send OTP email. Please check your email address or try again in a minute.',
    };
  }

  return {
    success: true,
    verificationId: domainReq.verificationId,
    expiresAt: domainReq.expiresAtUtc.getTime(),
    cooldownSeconds: config.otp.cooldownSeconds,
    attemptsRemaining: config.otp.maxResendAttempts - domainReq.resendCount,
  };
}

/**
 * @param {{ channel: string, destination: string, code: string, verificationId?: string }} input
 */
export async function verifyOtp(input) {
  const channel = channelEnum(input.channel);
  const destination = normalizeDestination(input.channel, input.destination);
  const code = String(input.code ?? '').trim();

  if (!destination || !code) {
    return { success: false, verified: false, error: 'Destination and code are required.' };
  }

  const destinationHash = hashOtpValue(destination);
  const channelDb = channelName(channel);
  const codeHash = hashOtpValue(code);
  const now = new Date();

  const row = input.verificationId
    ? await prisma.verificationRequest.findFirst({
        where: {
          verificationId: input.verificationId,
          destinationHash,
          channel: channelDb,
          isDeleted: false,
        },
      })
    : await prisma.verificationRequest.findFirst({
        where: {
          destinationHash,
          channel: channelDb,
          consumed: false,
          isDeleted: false,
        },
        orderBy: { createdAtUtc: 'desc' },
      });

  if (!row) {
    return { success: false, verified: false, error: 'No OTP requested for this destination.' };
  }

  const domainReq = rowToDomain(row);
  const outcome = domainReq.verify(codeHash, now);

  await persistRequest(domainReq);

  if (outcome === VerificationOutcome.Success) {
    return {
      success: true,
      verified: true,
      token: domainReq.verificationId,
    };
  }

  if (outcome === VerificationOutcome.Expired) {
    return { success: true, verified: false, expired: true, error: 'OTP expired.' };
  }

  if (outcome === VerificationOutcome.AlreadyConsumed) {
    return { success: false, verified: false, error: 'OTP already used. Request a new code.' };
  }

  const attemptsRemaining = Math.max(0, domainReq.maxVerifyAttempts - domainReq.verifyAttempts);
  return {
    success: true,
    verified: false,
    attemptsRemaining,
    error: outcome === VerificationOutcome.TooManyAttempts
      ? 'Too many attempts. Please request a new code.'
      : 'Invalid OTP.',
  };
}

/** Confirms a consumed AccountVerification OTP for register/login. */
export async function assertEmailVerificationForAuth(email, verificationId) {
  const normalized = normalizeDestination('email', email);
  const destHash = hashOtpValue(normalized);

  const row = await prisma.verificationRequest.findFirst({
    where: {
      verificationId,
      destinationHash: destHash,
      channel: 'Email',
      purpose: 'AccountVerification',
      consumed: true,
      isDeleted: false,
    },
  });

  if (!row) {
    const err = new Error('Email verification required. Please verify your email with OTP first.');
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }

  const verifiedAt = row.updatedAtUtc ?? row.createdAtUtc;
  const graceMs = config.otp.authGraceSeconds * 1000;
  if (Date.now() - verifiedAt.getTime() > graceMs) {
    const err = new Error('Email verification expired. Please verify your email again.');
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }

  return row;
}
