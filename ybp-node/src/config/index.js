import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

const defaults = loadJson('config/default.json');
const nodeEnv = process.env.NODE_ENV || defaults.nodeEnv;

export const config = {
  port: Number(process.env.PORT) || defaults.port,
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL || null,
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
      : defaults.cors.allowedOrigins,
  },
  logging: defaults.logging,
  swagger: defaults.swagger,
  isDevelopment: nodeEnv !== 'production',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'ybp-dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'ybp-dev-refresh-secret-change-me',
    accessTtl: process.env.JWT_ACCESS_TTL || '7d',
    refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS) || 30,
  },

  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    /** smtp (default) or resend — resend gives better inbox delivery with a verified domain. */
    provider: (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase(),
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'Yashvi Bagga Productions <noreply@ybproductions.local>',
    replyTo: process.env.EMAIL_REPLY_TO || process.env.SMTP_USER || '',
    siteUrl: process.env.SITE_URL || 'https://ybproductions.co.in',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    opsNotifyTo: process.env.OPS_NOTIFY_EMAIL || '',
  },

  sms: {
    enabled: process.env.SMS_ENABLED === 'true',
    provider: process.env.SMS_PROVIDER || 'console',
  },

  otp: {
    codeLength: Number(process.env.OTP_CODE_LENGTH) || 6,
    ttlSeconds: Number(process.env.OTP_TTL_SECONDS) || 300,
    maxVerifyAttempts: Number(process.env.OTP_MAX_VERIFY_ATTEMPTS) || 5,
    maxResendAttempts: Number(process.env.OTP_MAX_RESEND_ATTEMPTS) || 3,
    cooldownSeconds: Number(process.env.OTP_COOLDOWN_SECONDS) || 60,
    /** Window after OTP verify during which register/login may consume the token. */
    authGraceSeconds: Number(process.env.OTP_AUTH_GRACE_SECONDS) || 900,
    requiredForAuth: process.env.AUTH_OTP_REQUIRED === 'true' || nodeEnv === 'production',
  },
};
