/**
 * Safe environment variable access utility
 *
 * This module validates environment variables and provides
 * type-safe access to them.
 *
 * Use getServerEnv() for server-only env vars.
 * Use getClientEnv() for client-only env vars.
 */

import { getEnv, ensureEnv, type Env } from "./schema";
import { validateServerEnv, type ServerEnv } from "./server-schema";
import { validateClientEnv, type ClientEnv } from "./client-schema";

/**
 * Validated environment variables
 *
 * Automatically validated on first access.
 * Application throws at startup if there are any env var issues.
 */
export const env: Env = getEnv();

/**
 * Force environment variable validation
 *
 * Call explicitly at application startup to detect
 * env var issues early.
 *
 * Usage:
 * ```typescript
 * // app/layout.tsx or app/api/[...]/route.ts
 * import { validateEnvironment } from '@/app/lib/env/env';
 *
 * // Call on server side only
 * if (typeof window === 'undefined') {
 *   validateEnvironment();
 * }
 * ```
 */
export function validateEnvironment(): void {
  ensureEnv();
}

/**
 * Whether the current environment is development
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Whether the current environment is production
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * Whether the current environment is test
 */
export const isTest = env.NODE_ENV === "test";

/**
 * Get server-side environment variables
 *
 * Only available on the server side.
 * Throws if called from the client.
 */
let cachedServerEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() can only be used on the server side.");
  }
  if (!cachedServerEnv) {
    cachedServerEnv = validateServerEnv();
  }
  return cachedServerEnv;
}

/**
 * Get client-side environment variables
 *
 * Available on both client and server.
 * Only includes variables with the NEXT_PUBLIC_* prefix.
 */
let cachedClientEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (!cachedClientEnv) {
    cachedClientEnv = validateClientEnv();
  }
  return cachedClientEnv;
}
