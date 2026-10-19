import { logger } from '../logger.js';

/** Request logging roughly equivalent to Serilog request logging. */
export function requestLogging(req, res, next) {
  const started = Date.now();
  res.on('finish', () => {
    logger.info(
      `HTTP ${req.method} ${req.originalUrl} responded ${res.statusCode} in ${Date.now() - started} ms`,
    );
  });
  next();
}
