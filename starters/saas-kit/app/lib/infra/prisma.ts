/**
 * Prisma Client singleton instance (Lazy Initialization pattern)
 *
 * Prevents duplicate PrismaClient instances during Hot Reload in development.
 *
 * @remarks
 * - Production: creates a new PrismaClient instance
 * - Development: caches on global object for reuse
 * - Automatically adds connection pool params to reduce remote DB latency
 * - Lazy Initialization pattern prevents DB connection attempts at build time
 *
 * @server-only This file must only be imported on the server.
 */
import "server-only";

import { PrismaClient } from "@/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getServerEnv } from "../env/env";

/**
 * Appends connection pool parameters to DATABASE_URL.
 * Used to reduce connection latency for remote DBs such as Supabase.
 *
 * @param url Original DATABASE_URL
 * @returns DATABASE_URL with connection pool parameters appended
 */
function optimizeDatabaseUrl(url: string | undefined): string {
  // Build-time safety: return dummy URL if DATABASE_URL is missing or invalid
  // prisma generate must work without DATABASE_URL
  // Add Next.js build-time check
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

  if (!url || typeof url !== "string") {
    return "postgresql://localhost:5432/dummy?connection_limit=1";
  }

  // Clean URL string (trim whitespace, strip quotes and newlines)
  const cleanUrl = url
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\n/g, "")
    .replace(/\r/g, "");

  // Return dummy URL if empty string
  if (!cleanUrl) {
    return "postgresql://localhost:5432/dummy?connection_limit=1";
  }

  // Use only the first URL if multiple are separated by whitespace
  // or if multiple lines are present
  const firstUrl = cleanUrl.split(/\s+/)[0].split("\n")[0];

  // Return dummy URL if not starting with postgresql://
  if (
    !firstUrl.startsWith("postgresql://") &&
    !firstUrl.startsWith("postgres://")
  ) {
    return "postgresql://localhost:5432/dummy?connection_limit=1";
  }

  // Return dummy URL at build time (safety)
  if (isBuildTime) {
    return "postgresql://localhost:5432/dummy?connection_limit=1";
  }

  try {
    // Attempt URL parsing
    const urlObj = new URL(firstUrl);

    // Connection pool optimization parameters
    // Keep pool size small in Vercel serverless (1-2 per function recommended)
    // Larger pools can be used in regular server environments
    const isServerless = !!process.env.VERCEL;
    const connectionLimit = isServerless ? "1" : "10"; // Serverless: 1 (Supabase Nano pool=15, maximize concurrency), regular: 10

    const poolParams = {
      connection_limit: connectionLimit,
      pool_timeout: "10", // Connection pool timeout (seconds)
      connect_timeout: "10", // Connection attempt timeout (seconds)
    };

    // Merge with existing parameters
    Object.entries(poolParams).forEach(([key, value]) => {
      if (!urlObj.searchParams.has(key)) {
        urlObj.searchParams.set(key, value);
      }
    });

    return urlObj.toString();
  } catch (error) {
    // Return dummy URL on URL parse failure (build-time safety)
    // At runtime, a real connection attempt will surface the error — no problem
    // Suppress error log during Vercel build time (prevent build failure)
    if (!process.env.VERCEL || process.env.NODE_ENV !== "production") {
      console.warn(
        "DATABASE_URL parse failed, using dummy URL:",
        error instanceof Error ? error.message : error,
      );
    }
    return "postgresql://localhost:5432/dummy?connection_limit=1";
  }
}

/**
 * Singleton factory function for lazy PrismaClient initialization
 *
 * Prevents immediate execution at the top of the file to avoid DB connections at build time.
 * Instance is created only when prisma is actually used.
 */
const prismaClientSingleton = () => {
  // Get DATABASE_URL from server environment variables
  let databaseUrl: string | undefined;
  try {
    const serverEnv = getServerEnv();
    databaseUrl = serverEnv.DATABASE_URL;
  } catch (error) {
    // getServerEnv() may fail at build time — fall back to process.env
    databaseUrl = process.env.DATABASE_URL;
  }

  const connectionString = databaseUrl
    ? optimizeDatabaseUrl(databaseUrl)
    : "postgresql://localhost:5432/dummy?connection_limit=1";

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,
    log: (() => {
      try {
        const serverEnv = getServerEnv();
        return serverEnv.NODE_ENV === "production"
          ? ["error"]
          : ["error", "warn"];
      } catch {
        return process.env.NODE_ENV === "production"
          ? ["error"]
          : ["error", "warn"];
      }
    })(),
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * Prisma Client instance (true Lazy Initialization — performance optimized)
 *
 * @remarks
 * - Lazy Initialization: instance is created only when prisma is actually used
 * - Completely prevents DB connection attempts at build time (true lazy via getter)
 * - Stored on globalThis in development for Hot Reload compatibility
 * - Build-time safety: no instance created during prisma generate phase
 * - Performance: Proxy is replaced with the real instance after first access to remove overhead
 *
 * @example
 * ```typescript
 * import { prisma } from '@/app/lib/infra/prisma';
 *
 * const user = await prisma.user.findUnique({ where: { id: '123' } });
 * ```
 */
// True Lazy Initialization: use Proxy to initialize only on first access
// Replace with real instance after first access to remove performance overhead
let prismaInstance: ReturnType<typeof prismaClientSingleton> | null = null;

const prisma = new Proxy({} as ReturnType<typeof prismaClientSingleton>, {
  get(_target, prop) {
    // Check globalThis first (Hot Reload compatibility)
    if (globalThis.prisma && !prismaInstance) {
      prismaInstance = globalThis.prisma;
    }
    // Create instance only when prisma is actually used
    if (!prismaInstance) {
      prismaInstance = prismaClientSingleton();
      globalThis.prisma = prismaInstance;
    }
    const value = prismaInstance[prop as keyof typeof prismaInstance];
    // Bind this for functions
    if (typeof value === "function") {
      return value.bind(prismaInstance);
    }
    return value;
  },
});

export { prisma };

/**
 * Direct instance getter for PrismaAdapter (bypasses build-time check)
 *
 * NextAuth/Auth.js PrismaAdapter is called at module load time,
 * so build-time checks would cause dummy URL to be used.
 * This function always uses the real DATABASE_URL without build-time checks.
 */
// Singleton instance for PrismaAdapter
let adapterPrismaInstance: PrismaClient | null = null;

export function getPrismaForAdapter(): PrismaClient {
  // Reuse from globalThis if available (Hot Reload compatibility)
  if (globalThis.prisma) {
    adapterPrismaInstance = globalThis.prisma;
    return globalThis.prisma;
  }

  // Reuse module-level singleton instance
  if (adapterPrismaInstance) {
    return adapterPrismaInstance;
  }

  // Reuse existing prisma instance if available
  if (prismaInstance) {
    adapterPrismaInstance = prismaInstance;
    globalThis.prisma = prismaInstance;
    return prismaInstance;
  }

  // Use DATABASE_URL directly without build-time check
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("[getPrismaForAdapter] DATABASE_URL is not set, env:", {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      NEXT_PHASE: process.env.NEXT_PHASE,
    });
    throw new Error("DATABASE_URL is required for PrismaAdapter");
  }

  // Clean URL (strip whitespace and quotes)
  const cleanUrl = databaseUrl.trim().replace(/^["']|["']$/g, "");

  const adapter = new PrismaPg({ connectionString: cleanUrl });
  adapterPrismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });

  // Save to both globalThis and module instance to ensure reuse
  globalThis.prisma = adapterPrismaInstance;
  prismaInstance = adapterPrismaInstance;

  return adapterPrismaInstance;
}

// Preserve existing instance during Hot Reload in development
// Reuse if globalThis.prisma already exists
if (process.env.NODE_ENV !== "production" && globalThis.prisma) {
  prismaInstance = globalThis.prisma;
}
