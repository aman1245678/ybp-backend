import { createHash } from 'node:crypto';

const PEPPER = process.env.OTP_HASH_SECRET || 'ybp-otp-dev-pepper';

/** Normalizes email / mobile before hashing. */
export function normalizeDestination(channel, destination) {
  const raw = String(destination ?? '').trim();
  if (channel === 'email' || channel === 'Email') {
    return raw.toLowerCase();
  }
  return raw.replace(/\D/g, '');
}

/** SHA-256 hash with server pepper — never store plain OTP or destination. */
export function hashOtpValue(value) {
  return createHash('sha256').update(`${PEPPER}:${value}`).digest('hex');
}
