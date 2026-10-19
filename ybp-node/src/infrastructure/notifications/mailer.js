import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';
import { logger } from '../../api/logger.js';
import { prisma } from '../../persistence/prisma.js';
import { buildOtpEmail } from './emailTemplates.js';
import { sendViaResend, verifyResendTransport } from './resendProvider.js';

let transporter = null;

function resetTransporter() {
  transporter = null;
}

/** Gmail requires From address to match the authenticated SMTP user. */
function resolveFromAddress() {
  const smtpUser = config.email.smtp.user?.trim();
  if (!smtpUser) return config.email.from;

  const from = config.email.from || '';
  const match = from.match(/<([^>]+)>/);
  if (match && match[1].toLowerCase() !== smtpUser.toLowerCase()) {
    logger.warn('EMAIL_FROM does not match SMTP_USER; using SMTP user for deliverability', {
      from: match[1],
      smtpUser,
    });
  }

  const displayName = from.includes('<')
    ? from.replace(/<[^>]+>/, '').trim()
    : 'Yashvi Bagga Productions';

  return {
    name: displayName || 'Yashvi Bagga Productions',
    address: smtpUser,
  };
}

function getTransporter() {
  if (transporter) return transporter;
  if (!config.email.enabled || !config.email.smtp.host) {
    return null;
  }
  const port = config.email.smtp.port || 587;
  const secure = config.email.smtp.secure === true;
  transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: config.email.smtp.user
      ? {
          user: config.email.smtp.user,
          pass: String(config.email.smtp.pass || '').replace(/\s+/g, ''),
        }
      : undefined,
    tls: { minVersion: 'TLSv1.2' },
  });
  return transporter;
}

/** Verifies email transport at startup (production diagnostics). */
export async function verifyEmailTransport() {
  if (!config.email.enabled) {
    return { ok: false, mode: 'disabled', error: 'EMAIL_ENABLED is not true' };
  }
  if (config.email.provider === 'resend' && config.email.resendApiKey) {
    return verifyResendTransport();
  }
  const transport = getTransporter();
  if (!transport) {
    return { ok: false, mode: 'none', error: 'SMTP host/user not configured' };
  }
  try {
    await transport.verify();
    return { ok: true, mode: 'smtp' };
  } catch (err) {
    resetTransporter();
    return { ok: false, mode: 'smtp', error: err.message };
  }
}

async function recordDelivery({ channel, recipient, tag, templateKey, status, error, relatedType, relatedId, provider }) {
  try {
    await prisma.notificationDelivery.create({
      data: {
        channel,
        provider: provider || (channel === 'Email' ? 'smtp' : 'console'),
        recipient,
        tag,
        templateKey,
        status,
        error: error || null,
        relatedType: relatedType || null,
        relatedId: relatedId || null,
        attemptCount: 1,
      },
    });
  } catch (err) {
    logger.warn('Failed to record notification delivery', { err: err.message });
  }
}

/**
 * Sends email. In development without SMTP, logs to console and marks Sent.
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
  tag,
  templateKey,
  relatedType,
  relatedId,
  replyTo,
  headers,
}) {
  if (config.email.enabled && config.email.provider === 'resend' && config.email.resendApiKey) {
    try {
      const result = await sendViaResend({ to, subject, text, html, replyTo });
      await recordDelivery({
        channel: 'Email',
        recipient: to,
        tag,
        templateKey,
        status: result.ok ? 'Sent' : 'Failed',
        error: result.error || null,
        relatedType,
        relatedId,
        provider: 'resend',
      });
      return result;
    } catch (err) {
      logger.error('Resend send failed', { err: err.message, to });
      await recordDelivery({
        channel: 'Email',
        recipient: to,
        tag,
        templateKey,
        status: 'Failed',
        error: err.message,
        relatedType,
        relatedId,
        provider: 'resend',
      });
      return { ok: false, error: err.message };
    }
  }

  const transport = getTransporter();

  if (!config.email.enabled || !transport) {
    const unavailable = 'Email service is temporarily unavailable. Please try again in a few minutes.';
    if (config.isDevelopment) {
      logger.info('[EMAIL:console]', { to, subject, text });
      await recordDelivery({
        channel: 'Email',
        recipient: to,
        tag,
        templateKey,
        status: 'Sent',
        relatedType,
        relatedId,
        provider: 'console',
      });
      return { ok: true, mode: 'console' };
    }
    logger.error('[EMAIL:disabled]', { to, subject });
    await recordDelivery({
      channel: 'Email',
      recipient: to,
      tag,
      templateKey,
      status: 'Failed',
      error: unavailable,
      relatedType,
      relatedId,
      provider: 'none',
    });
    return { ok: false, error: unavailable };
  }

  try {
    const from = resolveFromAddress();
    const info = await transport.sendMail({
      from,
      to,
      replyTo: replyTo || config.email.replyTo || config.email.smtp.user || undefined,
      subject,
      text,
      html: html || undefined,
      headers: {
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        ...headers,
      },
    });
    await recordDelivery({
      channel: 'Email',
      recipient: to,
      tag,
      templateKey,
      status: 'Sent',
      relatedType,
      relatedId,
      provider: 'smtp',
    });
    return { ok: true, mode: 'smtp', messageId: info.messageId };
  } catch (err) {
    logger.error('Email send failed', { err: err.message, to });
    resetTransporter();
    await recordDelivery({
      channel: 'Email',
      recipient: to,
      tag,
      templateKey,
      status: 'Failed',
      error: err.message,
      relatedType,
      relatedId,
      provider: 'smtp',
    });
    return { ok: false, error: err.message };
  }
}

/** SMS stub — logs in console until MSG91/Twilio wired. */
export async function sendSms({ to, message, tag, relatedType, relatedId }) {
  logger.info('[SMS:console]', { to, message });
  await recordDelivery({
    channel: 'Sms',
    recipient: to,
    tag,
    templateKey: 'sms.console',
    status: config.sms.enabled ? 'Sent' : 'Skipped',
    relatedType,
    relatedId,
    provider: 'console',
  });
  return { ok: true, mode: 'console' };
}

export async function sendApplicationConfirmation({ application, title }) {
  const subject = `Application received — ${application.applicationId}`;
  const text = [
    `Dear ${application.contactName},`,
    '',
    `Thank you for submitting your ${title} application with Yashvi Bagga Productions.`,
    '',
    `Your Application ID: ${application.applicationId}`,
    '',
    'Please save this ID for future reference. Our team will review your submission and contact you within 1–2 business days.',
    '',
    'With regards,',
    'Yashvi Bagga Productions',
  ].join('\n');

  const userMail = await sendEmail({
    to: application.contactEmail,
    subject,
    text,
    tag: 'application.confirmation',
    templateKey: 'application.received.user',
    relatedType: 'FormSubmission',
    relatedId: application.id,
  });

  if (application.contactMobile) {
    await sendSms({
      to: application.contactMobile,
      message: `YBP: Your application ${application.applicationId} is received. We will contact you in 1-2 business days.`,
      tag: 'application.confirmation',
      relatedType: 'FormSubmission',
      relatedId: application.id,
    });
  }

  if (config.email.opsNotifyTo) {
    await sendEmail({
      to: config.email.opsNotifyTo,
      subject: `[New] ${title} — ${application.applicationId}`,
      text: `New ${title} submission\nID: ${application.applicationId}\nName: ${application.contactName}\nEmail: ${application.contactEmail}\nMobile: ${application.contactMobile || '-'}\nSource: ${application.source}`,
      tag: 'application.ops',
      templateKey: 'application.received.ops',
      relatedType: 'FormSubmission',
      relatedId: application.id,
    });
  }

  return userMail;
}

export async function sendOtpEmail({ to, code, purposeLabel }) {
  const minutes = Math.max(1, Math.floor((Number(process.env.OTP_TTL_SECONDS) || 300) / 60));
  const { subject, text, html } = buildOtpEmail({
    code,
    minutes,
    recipientEmail: to,
    purposeLabel,
  });

  return sendEmail({
    to,
    subject,
    text,
    html,
    tag: 'otp.email',
    templateKey: `otp.${(purposeLabel || 'verification').toLowerCase()}`,
  });
}

export async function sendWelcomeEmail({ user }) {
  const text = [
    `Dear ${user.fullName},`,
    '',
    'Welcome to Yashvi Bagga Productions.',
    'Your account has been created successfully. You can now log in and submit applications.',
    '',
    `Registered email: ${user.email}`,
    '',
    'With regards,',
    'Yashvi Bagga Productions',
  ].join('\n');

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Yashvi Bagga Productions',
    text,
    tag: 'auth.welcome',
    templateKey: 'auth.welcome',
    relatedType: 'User',
    relatedId: user.id,
  });
}
