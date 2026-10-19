import express from 'express';

const port = Number(process.env.PORT) || 8080;

function fallbackApp(err) {
  const app = express();
  const body = {
    service: 'YBP.Api',
    status: 'degraded',
    error: err ? String(err.stack || err.message || err) : undefined,
  };
  app.get('/', (_req, res) => res.json(body));
  app.get('/health', (_req, res) => res.status(200).json(body));
  app.get('/api/v1/ping', (_req, res) => res.json({ ...body, status: 'ok' }));
  return app;
}

process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
});
process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', err);
});

let app;
try {
  const { createApp } = await import('./app.js');
  app = createApp();
  console.log('YBP full app loaded');

  const { config } = await import('./config/index.js');
  if (config.email.enabled) {
    const { verifyEmailTransport } = await import('./infrastructure/notifications/mailer.js');
    verifyEmailTransport()
      .then((result) => console.log('SMTP readiness:', result))
      .catch((err) => console.error('SMTP verify failed', err));
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const { ensureAdminUser } = await import('./bootstrap/ensureAdminUser.js');
    try {
      await ensureAdminUser();
    } catch (err) {
      console.error('ensureAdminUser failed', err);
    }
  }
} catch (err) {
  console.error('createApp failed — running ping-only fallback', err);
  app = fallbackApp(err);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`YBP.Api listening on 0.0.0.0:${port}`);
});
