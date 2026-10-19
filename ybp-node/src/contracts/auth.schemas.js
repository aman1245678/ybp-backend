import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  mobile: z.string().trim().min(10).max(15).optional().or(z.literal('')),
  password: z.string().min(4).max(128),
  emailVerificationToken: z.string().trim().min(8).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  emailVerificationToken: z.string().trim().min(8).optional(),
});

export const submitApplicationSchema = z.object({
  formType: z.enum([
    'BRANDING',
    'CASTING_CREW',
    'IT_SOLUTIONS',
    'TRAINING',
    'DIGITAL_MARKETING',
    'SOCIAL_MEDIA',
    'MANPOWER_HIRE',
    'CREATIVE_CAREER',
    'FILM_TV_TALENT',
    'IT_CAREER',
    'OFFICE_JOB',
    'CONTACT',
    'JOIN_NETWORK',
  ]),
  source: z.enum(['MOBILE', 'WEBSITE', 'ADMIN']).optional().default('MOBILE'),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email(),
  contactMobile: z.string().trim().min(10).max(15).optional().or(z.literal('')),
  contactWhatsapp: z.string().trim().max(15).optional().or(z.literal('')),
  companyName: z.string().trim().max(200).optional().or(z.literal('')),
  preferredCommunication: z.array(z.string()).optional().default([]),
  /** Full wizard payload from mobile / website */
  payload: z.record(z.string(), z.any()).default({}),
});

export function parseOrThrow(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    const err = new Error(detail);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
  return result.data;
}
