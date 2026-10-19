import { config } from '../../config/index.js';
import { logger } from '../../api/logger.js';

/** Sends mail via Resend API (best inbox delivery when domain is verified). */
export async function sendViaResend({ to, subject, text, html, replyTo }) {
  const apiKey = config.email.resendApiKey?.trim();
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not configured.' };
  }

  const from = config.email.from?.trim() || 'Yashvi Bagga Productions <onboarding@resend.dev>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        html: html || undefined,
        reply_to: replyTo || config.email.replyTo || undefined,
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = body?.message || body?.error || `Resend HTTP ${response.status}`;
      logger.error('Resend send failed', { to, message });
      return { ok: false, error: message };
    }

    return { ok: true, mode: 'resend', messageId: body.id };
  } catch (err) {
    logger.error('Resend send failed', { to, err: err.message });
    return { ok: false, error: err.message };
  }
}

export async function verifyResendTransport() {
  const apiKey = config.email.resendApiKey?.trim();
  if (!apiKey) {
    return { ok: false, mode: 'resend', error: 'RESEND_API_KEY is not configured.' };
  }
  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) {
      return { ok: false, mode: 'resend', error: `Resend API HTTP ${response.status}` };
    }
    return { ok: true, mode: 'resend' };
  } catch (err) {
    return { ok: false, mode: 'resend', error: err.message };
  }
}
