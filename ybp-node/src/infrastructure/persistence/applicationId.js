import { randomUUID } from 'node:crypto';
import { prisma } from '../../persistence/prisma.js';
import { FORM_TYPE_CODES, todayYmd } from '../../shared/formTypes.js';

/**
 * Generates YBP-{TYPE}-{yyyyMMdd}-{####} using DB counter (mobile-compatible).
 */
export async function nextApplicationId(formType) {
  const typeCode = FORM_TYPE_CODES[formType];
  if (!typeCode) throw new Error(`Unknown form type: ${formType}`);

  const dateYmd = todayYmd();

  const row = await prisma.$transaction(async (tx) => {
    const existing = await tx.applicationCounter.findUnique({
      where: { typeCode_dateYmd: { typeCode, dateYmd } },
    });

    if (existing) {
      return tx.applicationCounter.update({
        where: { id: existing.id },
        data: { lastSeq: existing.lastSeq + 1 },
      });
    }

    return tx.applicationCounter.create({
      data: {
        id: randomUUID(),
        typeCode,
        dateYmd,
        lastSeq: 1,
      },
    });
  });

  return `YBP-${typeCode}-${dateYmd}-${String(row.lastSeq).padStart(4, '0')}`;
}
