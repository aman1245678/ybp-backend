import { Router } from 'express';
import { z } from 'zod';
import { requestOtp, verifyOtp } from '../../services/otpService.js';

const requestSchema = z.object({
  channel: z.enum(['email', 'mobile']).optional(),
  destination: z.string().trim().min(3),
  purpose: z.string().trim().optional(),
  provider: z.string().optional(),
});

const verifySchema = z.object({
  channel: z.enum(['email', 'mobile']).optional(),
  destination: z.string().trim().min(3),
  code: z.string().trim().min(4).max(12),
  verificationId: z.string().trim().optional(),
});

function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues.map((i) => i.message).join('; ');
    const err = new Error(detail);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
  return result.data;
}

export function otpRouter() {
  const router = Router();

  router.post('/email/request', async (req, res, next) => {
    try {
      const body = parse(requestSchema, req.body);
      const result = await requestOtp({
        channel: 'email',
        destination: body.destination,
        purpose: body.purpose,
      });
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  router.post('/email/verify', async (req, res, next) => {
    try {
      const body = parse(verifySchema, req.body);
      const result = await verifyOtp({
        channel: 'email',
        destination: body.destination,
        code: body.code,
        verificationId: body.verificationId,
      });
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  router.post('/mobile/request', async (req, res, next) => {
    try {
      const body = parse(requestSchema, req.body);
      const result = await requestOtp({
        channel: 'mobile',
        destination: body.destination,
        purpose: body.purpose,
      });
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  router.post('/mobile/verify', async (req, res, next) => {
    try {
      const body = parse(verifySchema, req.body);
      const result = await verifyOtp({
        channel: 'mobile',
        destination: body.destination,
        code: body.code,
        verificationId: body.verificationId,
      });
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
