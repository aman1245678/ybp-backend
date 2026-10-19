import { SystemClock } from '../../shared/time/SystemClock.js';

const clock = new SystemClock();

/**
 * GET /api/v1/ping — Milestone 1 liveness/diagnostics endpoint.
 * Mirrors YBP.Api Controllers/PingController.
 */
export function pingRouter(express) {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json({
      service: 'YBP.Api',
      status: 'ok',
      apiVersion: 'v1',
      timeUtc: clock.utcNow.toISOString(),
    });
  });

  return router;
}
