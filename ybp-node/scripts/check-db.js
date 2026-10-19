import { prisma, pingDatabase } from "../src/persistence/prisma.js";

try {
  await pingDatabase();
  console.log("DB UP");
} catch (e) {
  console.log("DB DOWN:", e.message);
} finally {
  await prisma.$disconnect();
}
