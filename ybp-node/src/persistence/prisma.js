import 'dotenv/config';

/**
 * Azure / URL parsers treat `@` in the password as the host separator.
 * `Aman@543820` must become `Aman%40543820` in DATABASE_URL.
 */
export function encodeDatabaseUrl(raw) {
  if (!raw) return raw;
  const schemeIdx = raw.indexOf('://');
  if (schemeIdx === -1) return raw;
  const lastAt = raw.lastIndexOf('@');
  if (lastAt === -1) return raw;
  const userPass = raw.slice(schemeIdx + 3, lastAt);
  const colon = userPass.indexOf(':');
  if (colon === -1) return raw;
  const user = userPass.slice(0, colon);
  const password = userPass.slice(colon + 1);
  const encodedPass =
    password.includes('@') || password.includes('/') || password.includes('#')
      ? encodeURIComponent(password)
      : password;
  return ensureSsl(`${raw.slice(0, schemeIdx + 3)}${user}:${encodedPass}${raw.slice(lastAt)}`);
}

function ensureSsl(url) {
  if (/sslmode=/i.test(url)) return url;
  return url.includes('?') ? `${url}&sslmode=require` : `${url}?sslmode=require`;
}

let clientPromise = null;

async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const connectionString = encodeDatabaseUrl(process.env.DATABASE_URL);
      if (!connectionString) {
        throw new Error('DATABASE_URL is not set.');
      }
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { PrismaClient } = await import('../generated/prisma/client.ts');
      const adapter = new PrismaPg({ 
        connectionString,
        ssl: { rejectUnauthorized: false }
      });
      return new PrismaClient({ adapter });
    })();
  }
  return clientPromise;
}

/** Nested calls like prisma.user.findMany() resolve after the client loads. */
function lazy(path = []) {
  const fn = function prismaLazy() {};
  return new Proxy(fn, {
    get(_target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined;
      if (typeof prop === 'symbol') return undefined;
      return lazy([...path, prop]);
    },
    apply(_target, _thisArg, args) {
      return getClient().then((db) => {
        let ctx = db;
        for (let i = 0; i < path.length - 1; i += 1) {
          ctx = ctx[path[i]];
        }
        const method = ctx[path[path.length - 1]];
        return method.apply(ctx, args);
      });
    },
  });
}

export const prisma = lazy();

export async function pingDatabase() {
  const db = await getClient();
  await db.$queryRaw`SELECT 1`;
  return true;
}

export async function disconnectPrisma() {
  if (!clientPromise) return;
  const db = await clientPromise.catch(() => null);
  await db?.$disconnect?.().catch(() => {});
  clientPromise = null;
}
