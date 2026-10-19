import { prisma } from '../../persistence/prisma.js';
import { verifyAccessToken } from '../../infrastructure/security/auth.js';

/** Optional auth — attaches req.user if Bearer token present and valid. */
export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, isDeleted: false },
    });
    if (user && user.status !== 'Suspended' && user.status !== 'Deactivated') {
      req.user = user;
    }
  } catch {
    /* ignore invalid token for optional */
  }
  return next();
}

/** Required auth — 401 if missing/invalid. */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ title: 'Unauthorized', detail: 'Access token required.', status: 401 });
    }
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, isDeleted: false },
    });
    if (!user || user.status === 'Suspended' || user.status === 'Deactivated') {
      return res.status(401).json({ title: 'Unauthorized', detail: 'Invalid or inactive account.', status: 401 });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ title: 'Unauthorized', detail: 'Invalid or expired token.', status: 401 });
  }
}

/** Admin-only — must be authenticated with Admin role. */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (res.headersSent) return;
    const roles = req.user?.roles || [];
    if (!roles.includes('Admin')) {
      return res.status(403).json({
        title: 'Forbidden',
        detail: 'Admin access required.',
        status: 403,
      });
    }
    return next();
  });
}
