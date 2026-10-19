import { randomUUID } from 'node:crypto';
import { prisma } from '../persistence/prisma.js';
import { hashPassword } from '../infrastructure/security/auth.js';

/**
 * Ensures the env-configured admin account exists with Admin role.
 * Safe to run on every boot — upserts password hash from ADMIN_PASSWORD.
 */
export async function ensureAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ensureAdminUser skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  const existing = await prisma.user.findFirst({
    where: { email: adminEmail, isDeleted: false },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        roles: ['Admin'],
        status: 'Active',
        fullName: existing.fullName || 'YBP Admin',
        isEmailVerified: true,
      },
    });
    console.log(`Admin user synced: ${adminEmail}`);
    return;
  }

  await prisma.user.create({
    data: {
      id: randomUUID(),
      fullName: 'YBP Admin',
      email: adminEmail,
      passwordHash,
      status: 'Active',
      isEmailVerified: true,
      roles: ['Admin'],
    },
  });
  console.log(`Admin user created: ${adminEmail}`);
}
