import { randomUUID } from 'node:crypto';
import { prisma } from '../src/persistence/prisma.js';
import { hashPassword } from '../src/infrastructure/security/auth.js';

/**
 * Seeds reference data: permission catalogue + default roles + optional admin user.
 * Run: npm run prisma:seed
 *
 * Admin user from env:
 *   ADMIN_EMAIL=admin@ybproductions.local
 *   ADMIN_PASSWORD=Admin@12345
 */
async function main() {
  const permissions = [
    { code: 'applications.advance-status', description: 'Advance application workflow status' },
    { code: 'applications.read', description: 'View applications' },
    { code: 'leads.read', description: 'View leads' },
    { code: 'leads.triage', description: 'Change lead triage status' },
    { code: 'registrations.approve', description: 'Approve/reject signup requests' },
    { code: 'registrations.issue-credentials', description: 'Issue credentials for approved signups' },
    { code: 'users.manage', description: 'Manage users and roles' },
    { code: 'cms.edit', description: 'Edit CMS content' },
    { code: 'audit.read', description: 'View audit logs' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      create: p,
      update: { description: p.description },
    });
  }

  const roles = [
    {
      type: 'Admin',
      name: 'Administrator',
      permissionCodes: permissions.map((p) => p.code),
    },
    {
      type: 'HR',
      name: 'Human Resources',
      permissionCodes: [
        'applications.read',
        'applications.advance-status',
        'leads.read',
        'leads.triage',
        'registrations.approve',
        'registrations.issue-credentials',
      ],
    },
    {
      type: 'Recruiter',
      name: 'Recruiter',
      permissionCodes: [
        'applications.read',
        'applications.advance-status',
        'leads.read',
        'leads.triage',
      ],
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { type: role.type },
      create: role,
      update: { name: role.name, permissionCodes: role.permissionCodes },
    });
  }

  console.log(`Seeded ${permissions.length} permissions and ${roles.length} roles.`);

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ybproductions.local').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
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
      },
    });
    console.log(`Updated admin user: ${adminEmail}`);
  } else {
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
    console.log(`Created admin user: ${adminEmail}`);
  }

  console.log('Admin login password is set from ADMIN_PASSWORD (default Admin@12345).');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
