import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../persistence/prisma.js';
import { FORM_TYPE_TITLES } from '../../shared/formTypes.js';
import { parseOrThrow } from '../../contracts/auth.schemas.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendEmail, sendSms } from '../../infrastructure/notifications/mailer.js';

const STATUS_VALUES = [
  'Received',
  'UnderReview',
  'Contacted',
  'InProgress',
  'Closed',
  'Rejected',
];

const USER_STATUS_VALUES = ['Active', 'Invited', 'Suspended', 'Deactivated'];

const ROLE_VALUES = [
  'Admin',
  'HR',
  'Recruiter',
  'Talent',
  'MediaProfessional',
  'Client',
  'Trainer',
];

const statusSchema = z.object({
  status: z.enum(STATUS_VALUES),
  note: z.string().trim().max(500).optional().or(z.literal('')),
});

const userUpdateSchema = z.object({
  status: z.enum(USER_STATUS_VALUES).optional(),
  roles: z.array(z.enum(ROLE_VALUES)).optional(),
  fullName: z.string().trim().min(2).max(120).optional(),
  mobile: z.string().trim().max(15).optional().or(z.literal('')),
});

function mapRow(row) {
  return {
    id: row.id,
    applicationId: row.applicationId,
    formType: row.formType,
    typeCode: row.typeCode,
    userKind: row.userKind,
    source: row.source,
    status: row.status,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactMobile: row.contactMobile,
    contactWhatsapp: row.contactWhatsapp,
    companyName: row.companyName,
    preferredCommunication: row.preferredCommunication,
    payload: row.payload,
    userId: row.userId,
    createdAtUtc: row.createdAtUtc,
    updatedAtUtc: row.updatedAtUtc,
    title: FORM_TYPE_TITLES[row.formType] || row.formType,
  };
}

function mapUser(row, applicationCount = undefined) {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    mobile: row.mobile,
    status: row.status,
    roles: row.roles,
    isEmailVerified: row.isEmailVerified,
    isMobileVerified: row.isMobileVerified,
    createdAtUtc: row.createdAtUtc,
    updatedAtUtc: row.updatedAtUtc,
    ...(applicationCount !== undefined ? { applicationCount } : {}),
  };
}

export function adminRouter() {
  const router = Router();
  router.use(requireAdmin);

  /** Dashboard summary: submissions, users, 14-day trend. */
  router.get('/summary', async (_req, res, next) => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        total,
        byStatus,
        byFormType,
        bySource,
        recent,
        usersTotal,
        usersByStatus,
        usersRecent,
        trend,
      ] = await Promise.all([
        prisma.formSubmission.count({ where: { isDeleted: false } }),
        prisma.formSubmission.groupBy({
          by: ['status'],
          where: { isDeleted: false },
          _count: { _all: true },
        }),
        prisma.formSubmission.groupBy({
          by: ['formType'],
          where: { isDeleted: false },
          _count: { _all: true },
        }),
        prisma.formSubmission.groupBy({
          by: ['source'],
          where: { isDeleted: false },
          _count: { _all: true },
        }),
        prisma.formSubmission.count({
          where: { isDeleted: false, createdAtUtc: { gte: weekAgo } },
        }),
        prisma.user.count({ where: { isDeleted: false } }),
        prisma.user.groupBy({
          by: ['status'],
          where: { isDeleted: false },
          _count: { _all: true },
        }),
        prisma.user.count({ where: { isDeleted: false, createdAtUtc: { gte: weekAgo } } }),
        prisma.$queryRaw`
          SELECT to_char(date_trunc('day', "createdAtUtc"), 'YYYY-MM-DD') AS day,
                 COUNT(*)::int AS count
          FROM form_submissions
          WHERE "isDeleted" = false
            AND "createdAtUtc" >= (NOW() - INTERVAL '13 days')
          GROUP BY 1
          ORDER BY 1
        `,
      ]);

      return res.json({
        total,
        last7Days: recent,
        byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])),
        byFormType: Object.fromEntries(byFormType.map((r) => [r.formType, r._count._all])),
        bySource: Object.fromEntries(bySource.map((r) => [r.source, r._count._all])),
        users: {
          total: usersTotal,
          last7Days: usersRecent,
          byStatus: Object.fromEntries(usersByStatus.map((r) => [r.status, r._count._all])),
        },
        trend: trend.map((r) => ({ day: r.day, count: Number(r.count) })),
      });
    } catch (err) {
      return next(err);
    }
  });

  /** Recent activity feed (audit log). */
  router.get('/activity', async (req, res, next) => {
    try {
      const take = Math.min(50, Math.max(1, Number(req.query.take) || 15));
      const rows = await prisma.auditLog.findMany({
        orderBy: { occurredAtUtc: 'desc' },
        take,
      });
      return res.json({
        items: rows.map((r) => ({
          id: r.id,
          action: r.action,
          entityType: r.entityType,
          entityId: r.entityId,
          detail: r.detail,
          occurredAtUtc: r.occurredAtUtc,
        })),
      });
    } catch (err) {
      return next(err);
    }
  });

  /** List all form submissions (paginated + filters). */
  router.get('/applications', async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
      const status = req.query.status ? String(req.query.status) : null;
      const formType = req.query.formType ? String(req.query.formType) : null;
      const source = req.query.source ? String(req.query.source) : null;
      const userKind = req.query.userKind ? String(req.query.userKind) : null;
      const payloadIntent = req.query.payloadIntent ? String(req.query.payloadIntent) : null;
      const payloadCrewTrack = req.query.payloadCrewTrack ? String(req.query.payloadCrewTrack) : null;
      const q = req.query.q ? String(req.query.q).trim() : '';

      const payloadFilter = payloadIntent
        ? { path: ['intent'], equals: payloadIntent }
        : payloadCrewTrack
          ? { path: ['crewTrack'], equals: payloadCrewTrack }
          : null;

      const where = {
        isDeleted: false,
        ...(status ? { status } : {}),
        ...(formType ? { formType } : {}),
        ...(source ? { source } : {}),
        ...(userKind ? { userKind } : {}),
        ...(payloadFilter ? { payload: payloadFilter } : {}),
        ...(q
          ? {
              OR: [
                { applicationId: { contains: q, mode: 'insensitive' } },
                { contactName: { contains: q, mode: 'insensitive' } },
                { contactEmail: { contains: q, mode: 'insensitive' } },
                { contactMobile: { contains: q } },
                { companyName: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      };

      const [total, rows] = await Promise.all([
        prisma.formSubmission.count({ where }),
        prisma.formSubmission.findMany({
          where,
          orderBy: { createdAtUtc: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      return res.json({
        items: rows.map(mapRow),
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      });
    } catch (err) {
      return next(err);
    }
  });

  /** Single application detail. */
  router.get('/applications/:id', async (req, res, next) => {
    try {
      const row = await prisma.formSubmission.findFirst({
        where: {
          isDeleted: false,
          OR: [{ id: req.params.id }, { applicationId: req.params.id }],
        },
      });
      if (!row) {
        return res.status(404).json({ title: 'Not Found', detail: 'Application not found.', status: 404 });
      }
      return res.json({ application: mapRow(row) });
    } catch (err) {
      return next(err);
    }
  });

  /** Update application status (+ notify applicant). */
  router.patch('/applications/:id/status', async (req, res, next) => {
    try {
      const body = parseOrThrow(statusSchema, req.body);
      const row = await prisma.formSubmission.findFirst({
        where: {
          isDeleted: false,
          OR: [{ id: req.params.id }, { applicationId: req.params.id }],
        },
      });
      if (!row) {
        return res.status(404).json({ title: 'Not Found', detail: 'Application not found.', status: 404 });
      }

      const updated = await prisma.formSubmission.update({
        where: { id: row.id },
        data: {
          status: body.status,
          updatedAtUtc: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          id: randomUUID(),
          action: 'StatusChange',
          entityType: 'FormSubmission',
          entityId: updated.id,
          performedByUserId: req.user.id,
          detail: `${updated.applicationId}: ${row.status} → ${body.status}${body.note ? ` (${body.note})` : ''}`,
          occurredAtUtc: new Date(),
        },
      });

      const title = FORM_TYPE_TITLES[updated.formType] || updated.formType;
      const noteLine = body.note ? `\nNote: ${body.note}` : '';
      sendEmail({
        to: updated.contactEmail,
        subject: `Application update — ${updated.applicationId}`,
        text: `Dear ${updated.contactName},\n\nYour ${title} application (${updated.applicationId}) status is now: ${body.status}.${noteLine}\n\nYashvi Bagga Productions`,
        tag: 'application.status',
        templateKey: 'application.status.user',
        relatedType: 'FormSubmission',
        relatedId: updated.id,
      }).catch(() => {});

      if (updated.contactMobile) {
        sendSms({
          to: updated.contactMobile,
          message: `YBP: Application ${updated.applicationId} is now ${body.status}.`,
          tag: 'application.status',
          relatedType: 'FormSubmission',
          relatedId: updated.id,
        }).catch(() => {});
      }

      return res.json({
        message: 'Status updated.',
        application: mapRow(updated),
      });
    } catch (err) {
      return next(err);
    }
  });

  // ─── Registered users (signups) ────────────────────────────────────────────

  /** List registered users with their application counts. */
  router.get('/users', async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
      const status = req.query.status ? String(req.query.status) : null;
      const role = req.query.role ? String(req.query.role) : null;
      const q = req.query.q ? String(req.query.q).trim() : '';

      const where = {
        isDeleted: false,
        ...(status ? { status } : {}),
        ...(role ? { roles: { has: role } } : {}),
        ...(q
          ? {
              OR: [
                { fullName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { mobile: { contains: q } },
              ],
            }
          : {}),
      };

      const [total, rows] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          orderBy: { createdAtUtc: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { _count: { select: { formSubmissions: true } } },
        }),
      ]);

      return res.json({
        items: rows.map((r) => mapUser(r, r._count.formSubmissions)),
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      });
    } catch (err) {
      return next(err);
    }
  });

  /** Single user + their submissions. */
  router.get('/users/:id', async (req, res, next) => {
    try {
      const user = await prisma.user.findFirst({
        where: { id: req.params.id, isDeleted: false },
      });
      if (!user) {
        return res.status(404).json({ title: 'Not Found', detail: 'User not found.', status: 404 });
      }

      const applications = await prisma.formSubmission.findMany({
        where: {
          isDeleted: false,
          OR: [{ userId: user.id }, { contactEmail: user.email }],
        },
        orderBy: { createdAtUtc: 'desc' },
        take: 50,
      });

      return res.json({
        user: mapUser(user, applications.length),
        applications: applications.map(mapRow),
      });
    } catch (err) {
      return next(err);
    }
  });

  /** Update a user's status / roles / basic profile. */
  router.patch('/users/:id', async (req, res, next) => {
    try {
      const body = parseOrThrow(userUpdateSchema, req.body);
      const user = await prisma.user.findFirst({
        where: { id: req.params.id, isDeleted: false },
      });
      if (!user) {
        return res.status(404).json({ title: 'Not Found', detail: 'User not found.', status: 404 });
      }
      if (user.id === req.user.id && body.status && body.status !== 'Active') {
        return res.status(400).json({
          title: 'Bad Request',
          detail: 'You cannot deactivate your own admin account.',
          status: 400,
        });
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(body.status ? { status: body.status } : {}),
          ...(body.roles ? { roles: body.roles } : {}),
          ...(body.fullName ? { fullName: body.fullName } : {}),
          ...(body.mobile !== undefined ? { mobile: body.mobile || null } : {}),
          updatedAtUtc: new Date(),
          updatedBy: req.user.id,
        },
      });

      const changes = [];
      if (body.status && body.status !== user.status) changes.push(`status ${user.status} → ${body.status}`);
      if (body.roles) changes.push(`roles → ${body.roles.join(', ') || 'none'}`);

      await prisma.auditLog.create({
        data: {
          id: randomUUID(),
          action: body.roles ? 'IssueCredentials' : 'Update',
          entityType: 'User',
          entityId: updated.id,
          performedByUserId: req.user.id,
          detail: `${updated.email}: ${changes.join('; ') || 'profile updated'}`,
          occurredAtUtc: new Date(),
        },
      });

      return res.json({ message: 'User updated.', user: mapUser(updated) });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
