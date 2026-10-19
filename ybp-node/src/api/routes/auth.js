import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../../persistence/prisma.js';
import { parseOrThrow, registerSchema, loginSchema } from '../../contracts/auth.schemas.js';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  createRefreshTokenValue,
  refreshExpiryDate,
} from '../../infrastructure/security/auth.js';
import { sendWelcomeEmail } from '../../infrastructure/notifications/mailer.js';
import { requireAuth } from '../middleware/auth.js';
import { config } from '../../config/index.js';
import { assertEmailVerificationForAuth } from '../../services/otpService.js';

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    roles: user.roles,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
  };
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = createRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      token: refreshToken,
      expiresAtUtc: refreshExpiryDate(),
    },
  });
  return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: '7d' };
}

export function authRouter() {
  const router = Router();

  /**
   * @openapi
   * /api/v1/auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Register a new user (mobile / website)
   */
  router.post('/register', async (req, res, next) => {
    try {
      const body = parseOrThrow(registerSchema, req.body);
      const email = body.email.toLowerCase();

      if (config.otp.requiredForAuth) {
        if (!body.emailVerificationToken) {
          return res.status(400).json({
            title: 'Validation Error',
            detail: 'Email verification required. Please verify your email with OTP first.',
            status: 400,
          });
        }
      }

      const existing = await prisma.user.findFirst({
        where: { email, isDeleted: false },
      });
      if (existing) {
        return res.status(409).json({
          title: 'Conflict',
          detail: 'An account with this email already exists. Please log in.',
          status: 409,
        });
      }

      if (config.otp.requiredForAuth) {
        await assertEmailVerificationForAuth(email, body.emailVerificationToken);
      }

      const passwordHash = await hashPassword(body.password);
      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          fullName: body.fullName,
          email,
          mobile: body.mobile ? body.mobile : null,
          passwordHash,
          status: 'Active',
          isEmailVerified: config.otp.requiredForAuth,
          roles: [],
        },
      });

      // Fire-and-forget welcome mail
      sendWelcomeEmail({ user }).catch(() => {});

      const tokens = await issueTokens(user);
      return res.status(201).json({
        message: 'Registration successful.',
        user: publicUser(user),
        ...tokens,
      });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const body = parseOrThrow(loginSchema, req.body);
      const email = body.email.toLowerCase();

      if (config.otp.requiredForAuth) {
        if (!body.emailVerificationToken) {
          return res.status(400).json({
            title: 'Validation Error',
            detail: 'Email verification required. Please verify your email with OTP first.',
            status: 400,
          });
        }
        await assertEmailVerificationForAuth(email, body.emailVerificationToken);
      }

      const user = await prisma.user.findFirst({
        where: { email, isDeleted: false },
      });

      if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
        return res.status(401).json({
          title: 'Unauthorized',
          detail: 'Invalid email or password.',
          status: 401,
        });
      }

      if (user.status === 'Suspended' || user.status === 'Deactivated') {
        return res.status(403).json({
          title: 'Forbidden',
          detail: 'Account is not active.',
          status: 403,
        });
      }

      await prisma.auditLog.create({
        data: {
          id: randomUUID(),
          action: 'Login',
          entityType: 'User',
          entityId: user.id,
          performedByUserId: user.id,
          detail: 'User logged in',
          occurredAtUtc: new Date(),
        },
      });

      const tokens = await issueTokens(user);
      return res.json({
        message: 'Login successful.',
        user: publicUser(user),
        ...tokens,
      });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/refresh', async (req, res, next) => {
    try {
      const token = req.body?.refreshToken;
      if (!token) {
        return res.status(400).json({ title: 'Bad Request', detail: 'refreshToken required.', status: 400 });
      }

      const stored = await prisma.refreshToken.findUnique({ where: { token } });
      if (!stored || stored.revokedAtUtc || stored.expiresAtUtc < new Date()) {
        return res.status(401).json({ title: 'Unauthorized', detail: 'Invalid refresh token.', status: 401 });
      }

      const user = await prisma.user.findFirst({
        where: { id: stored.userId, isDeleted: false },
      });
      if (!user) {
        return res.status(401).json({ title: 'Unauthorized', detail: 'User not found.', status: 401 });
      }

      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAtUtc: new Date() },
      });

      const tokens = await issueTokens(user);
      return res.json({ user: publicUser(user), ...tokens });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/logout', async (req, res, next) => {
    try {
      const token = req.body?.refreshToken;
      if (token) {
        await prisma.refreshToken.updateMany({
          where: { token, revokedAtUtc: null },
          data: { revokedAtUtc: new Date() },
        });
      }
      return res.json({ message: 'Logged out.' });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/me', requireAuth, async (req, res) => {
    return res.json({ user: publicUser(req.user) });
  });

  return router;
}
