import { DomainException } from '../../domain/common/exceptions/DomainException.js';
import { logger } from '../logger.js';

/** Maps domain failures to HTTP responses (Application-layer boundary equivalent). */
export function errorHandler(err, _req, res, _next) {
  if (err.name === 'ValidationError' || err.status === 400) {
    return res.status(400).json({
      title: 'Validation Error',
      detail: err.message,
      status: 400,
    });
  }

  if (err instanceof DomainException) {
    const status = err.name === 'InvalidStatusTransitionException' ? 409 : 400;
    return res.status(status).json({
      title: err.name,
      detail: err.message,
      status,
    });
  }

  logger.error('Unhandled error', { err: err?.message, stack: err?.stack });
  return res.status(500).json({
    title: 'Internal Server Error',
    detail: 'An unexpected error occurred.',
    status: 500,
    ...(process.env.NODE_ENV !== 'production' ? { debug: err?.message } : {}),
  });
}
