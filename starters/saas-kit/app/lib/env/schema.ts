/**
 * Zod schema for environment variable validation (unified)
 *
 * Validates both server and client environment variables together.
 *
 * @deprecated Use server-env-schema.ts for server-only env vars.
 * Use client-env-schema.ts for client-only env vars.
 * This file is kept for backwards compatibility.
 */

import { z } from "zod";
import { serverEnvSchema, type ServerEnv } from "./server-schema";
import { clientEnvSchema, type ClientEnv } from "./client-schema";

/**
 * Unified environment variable schema (server + client)
 *
 * Kept for backwards compatibility. New code should use
 * server-env-schema.ts and client-env-schema.ts directly.
 */
const envSchema = serverEnvSchema.merge(clientEnvSchema);

/**
 * Environment variable type (server + client)
 */
export type Env = ServerEnv & ClientEnv;

/**
 * Validate and return environment variables
 *
 * @throws {Error} If required variables are missing or have invalid format
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter((e) => {
          if (e.code === "invalid_type") {
            const invalidTypeIssue = e as { received?: string };
            return invalidTypeIssue.received === "undefined";
          }
          return false;
        })
        .map((e) => e.path.join("."));

      const invalidVars = error.issues
        .filter((e) => {
          if (e.code === "invalid_type") {
            const invalidTypeIssue = e as { received?: string };
            return invalidTypeIssue.received !== "undefined";
          }
          return true;
        })
        .map((e) => `${e.path.join(".")}: ${e.message}`);

      const errorMessages: string[] = [];

      if (missingVars.length > 0) {
        errorMessages.push(
          `Missing required env vars: ${missingVars.join(", ")}`,
        );
      }

      if (invalidVars.length > 0) {
        errorMessages.push(`Env var format errors:\n${invalidVars.join("\n")}`);
      }

      throw new Error(
        `Environment validation failed:\n${errorMessages.join("\n\n")}\n\n` +
          `Required env vars:\n` +
          `- DATABASE_URL: PostgreSQL connection string\n` +
          `- NEXTAUTH_SECRET: Secret key (min 32 chars)\n` +
          `- NEXTAUTH_URL: Application URL\n` +
          `- GCP_KMS_KEY_NAME or ENCRYPTION_KEY: Encryption config`,
        { cause: error },
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables (validated once at startup)
 *
 * Note: Validated at module load time.
 * Restart the application after changing env vars.
 */
let validatedEnv: Env | null = null;

/**
 * Get environment variables (lazy validation)
 *
 * Validates on first call, returns cached value thereafter.
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    validatedEnv = validateEnv();
  }
  return validatedEnv;
}

/**
 * Force environment variable validation
 *
 * Call explicitly at application startup to detect
 * env var issues early.
 */
export function ensureEnv(): void {
  getEnv();
}
