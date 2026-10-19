// Allow Node to accept Render internal self-signed TLS certificates for PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export function encodeDatabaseUrl(raw) {
  if (!raw) return raw;
  let url = raw;
  const schemeIdx = url.indexOf('://');
  if (schemeIdx !== -1) {
    const lastAt = url.lastIndexOf('@');
    if (lastAt !== -1) {
      const userPass = url.slice(schemeIdx + 3, lastAt);
      const colon = userPass.indexOf(':');
      if (colon !== -1) {
        const user = userPass.slice(0, colon);
        const password = userPass.slice(colon + 1);
        const encodedPass =
          password.includes('@') || password.includes('/') || password.includes('#')
            ? encodeURIComponent(password)
            : password;
        url = `${url.slice(0, schemeIdx + 3)}${user}:${encodedPass}${url.slice(lastAt)}`;
      }
    }
  }
  // Strip sslmode query params so pg library uses our explicit ssl object instead of libpq defaults
  url = url.replace(/([?&])sslmode=[^&]+(&|$)/gi, '$1').replace(/[?&]$/, '');
  return url;
}

let clientPromise = null;

async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const connectionString = encodeDatabaseUrl(process.env.DATABASE_URL);
      if (!connectionString) {
        throw new Error('DATABASE_URL is not set.');
      }
      const pgModule = await import('pg');
      const Pool = pgModule.default?.Pool || pgModule.Pool;
      const pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
      });
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { PrismaClient } = await import('../generated/prisma/client.ts');
      const adapter = new PrismaPg(pool);
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
