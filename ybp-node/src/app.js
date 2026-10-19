import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { pingRouter } from './api/routes/ping.js';
import { authRouter } from './api/routes/auth.js';
import { applicationsRouter } from './api/routes/applications.js';
import { adminRouter } from './api/routes/admin.js';
import { uploadsRouter, UPLOAD_ROOT } from './api/routes/uploads.js';
import { otpRouter } from './api/routes/otp.js';
import { mountSwagger } from './api/swagger/setup.js';
import { requestLogging } from './api/middleware/requestLogging.js';
import { errorHandler } from './api/middleware/errorHandler.js';

/**
 * Builds the Express application mirroring YBP.Api Program.cs pipeline:
 * logging → (swagger in Development) → CORS → controllers → health → errors.
 */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogging);

  app.use(cors({
    origin: config.cors.allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  }));

  app.use('/uploads', express.static(UPLOAD_ROOT));

  if (config.isDevelopment) {
    mountSwagger(app);
  }

  app.use('/api/v1/ping', pingRouter(express));
  app.use('/api/v1/auth', authRouter());
  app.use('/api/v1/applications', applicationsRouter());
  app.use('/api/v1/admin', adminRouter());
  app.use('/api/v1/uploads', uploadsRouter());
  app.use('/api/v1/otp', otpRouter());

  app.get('/health', async (_req, res) => {
    try {
      const { pingDatabase } = await import('./persistence/prisma.js');
      await pingDatabase();
      res.json({ status: 'Healthy', database: 'up' });
    } catch (err) {
      res.status(503).json({
        status: 'Unhealthy',
        database: 'down',
        detail: err?.message ?? 'Database unreachable',
      });
    }
  });

  app.use(errorHandler);
  return app;
}
