const SITE_URL = process.env.SITE_URL || 'https://ybproductions.co.in';
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');
const SUPPORT_EMAIL = process.env.EMAIL_REPLY_TO || process.env.SMTP_USER || 'noreply1ybproduction@gmail.com';

/**
 * Light, plain layout — dark OTP templates are often flagged as phishing by Gmail.
 */
export function brandedEmailLayout({ bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px">
          <tr>
            <td style="padding:24px 28px 8px;font-size:18px;font-weight:600;color:#111827">
              Yashvi Bagga Productions
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;font-size:15px;line-height:1.6;color:#374151">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.5;color:#6b7280">
              <p style="margin:0 0 6px">Yashvi Bagga Productions · Film, TV &amp; Digital Production</p>
              <p style="margin:0">
                <a href="${SITE_URL}" style="color:#374151">${SITE_HOST}</a>
                · <a href="mailto:${SUPPORT_EMAIL}" style="color:#374151">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** OTP verification email — plain style, code only in body (never subject). */
export function buildOtpEmail({ code, minutes, recipientEmail, purposeLabel }) {
  const action =
    purposeLabel === 'AccountVerification'
      ? 'verify your email for sign in or registration'
      : 'complete your request';

  const subject = 'Verify your email — Yashvi Bagga Productions';

  const text = [
    'Hello,',
    '',
    `Use the code below to ${action} on ${SITE_HOST}.`,
    '',
    code,
    '',
    `This code expires in ${minutes} minutes.`,
    `This email was sent to ${recipientEmail}.`,
    '',
    'If you did not request this code, you can ignore this email. Your account will not be changed.',
    '',
    'Yashvi Bagga Productions',
    SITE_URL,
    SUPPORT_EMAIL,
  ].join('\n');

  const bodyHtml = `
    <p style="margin:0 0 16px">Hello,</p>
    <p style="margin:0 0 16px">Use the code below to ${action} on <a href="${SITE_URL}" style="color:#374151">${SITE_HOST}</a>.</p>
    <p style="margin:0 0 16px;font-size:28px;font-weight:700;letter-spacing:6px;color:#111827">${code}</p>
    <p style="margin:0 0 12px">This code expires in ${minutes} minutes.</p>
    <p style="margin:0 0 12px;font-size:13px;color:#6b7280">Sent to ${recipientEmail}</p>
    <p style="margin:0;font-size:13px;color:#6b7280">If you did not request this code, you can ignore this email.</p>
  `;

  const html = brandedEmailLayout({ bodyHtml });

  return { subject, text, html };
}
