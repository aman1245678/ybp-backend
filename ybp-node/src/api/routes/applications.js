import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../../persistence/prisma.js';
import { parseOrThrow, submitApplicationSchema } from '../../contracts/auth.schemas.js';
import { FORM_TYPE_CODES, FORM_TYPE_TITLES, resolveUserKind } from '../../shared/formTypes.js';
import { nextApplicationId } from '../../infrastructure/persistence/applicationId.js';
import { sendApplicationConfirmation } from '../../infrastructure/notifications/mailer.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

function mapSubmission(row) {
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
    companyName: row.companyName,
    preferredCommunication: row.preferredCommunication,
    payload: row.payload,
    createdAtUtc: row.createdAtUtc,
    title: FORM_TYPE_TITLES[row.formType] || row.formType,
  };
}

export function applicationsRouter() {
  const router = Router();

  /** List supported form types (for mobile/website). */
  router.get('/types', (_req, res) => {
    const types = Object.keys(FORM_TYPE_CODES).map((formType) => ({
      formType,
      typeCode: FORM_TYPE_CODES[formType],
      title: FORM_TYPE_TITLES[formType],
      userKind: resolveUserKind(formType),
    }));
    return res.json({ types });
  });

  /**
   * Submit any of the 11 mobile/website forms.
   * Auth optional — if logged in, links to userId.
   */
  router.post('/', optionalAuth, async (req, res, next) => {
    try {
      const body = parseOrThrow(submitApplicationSchema, req.body);
      const formType = body.formType;
      const typeCode = FORM_TYPE_CODES[formType];
      const userKind = resolveUserKind(formType);
      const applicationId = await nextApplicationId(formType);

      const submission = await prisma.formSubmission.create({
        data: {
          id: randomUUID(),
          applicationId,
          formType,
          typeCode,
          userKind,
          source: body.source || 'MOBILE',
          status: 'Received',
          userId: req.user?.id || null,
          contactName: body.contactName,
          contactEmail: body.contactEmail.toLowerCase(),
          contactMobile: body.contactMobile ? body.contactMobile : null,
          contactWhatsapp: body.contactWhatsapp ? body.contactWhatsapp : null,
          companyName: body.companyName ? body.companyName : null,
          preferredCommunication: body.preferredCommunication || [],
          payload: body.payload || {},
        },
      });

      await prisma.auditLog.create({
        data: {
          id: randomUUID(),
          action: 'Create',
          entityType: 'FormSubmission',
          entityId: submission.id,
          performedByUserId: req.user?.id || null,
          detail: `${formType} submitted as ${applicationId}`,
          occurredAtUtc: new Date(),
        },
      });

      // Confirmation email + SMS (console stub if SMTP not configured)
      sendApplicationConfirmation({
        application: submission,
        title: FORM_TYPE_TITLES[formType],
      }).catch(() => {});

      return res.status(201).json({
        message: 'Application received. Confirmation will be sent shortly.',
        applicationId: submission.applicationId,
        status: submission.status,
        formType: submission.formType,
        title: FORM_TYPE_TITLES[formType],
        application: mapSubmission(submission),
      });
    } catch (err) {
      return next(err);
    }
  });

  /** Lookup by Application ID (public — for status check). */
  router.get('/by-code/:applicationId', async (req, res, next) => {
    try {
      const row = await prisma.formSubmission.findFirst({
        where: { applicationId: req.params.applicationId, isDeleted: false },
      });
      if (!row) {
        return res.status(404).json({ title: 'Not Found', detail: 'Application not found.', status: 404 });
      }
      return res.json({
        applicationId: row.applicationId,
        formType: row.formType,
        title: FORM_TYPE_TITLES[row.formType],
        status: row.status,
        createdAtUtc: row.createdAtUtc,
        contactName: row.contactName,
      });
    } catch (err) {
      return next(err);
    }
  });

  /** Logged-in user's applications. */
  router.get('/mine', requireAuth, async (req, res, next) => {
    try {
      const rows = await prisma.formSubmission.findMany({
        where: {
          isDeleted: false,
          OR: [
            { userId: req.user.id },
            { contactEmail: req.user.email },
          ],
        },
        orderBy: { createdAtUtc: 'desc' },
        take: 100,
      });
      return res.json({ items: rows.map(mapSubmission) });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
