/**
 * Zod schema for client-side environment variable validation
 *
 * Validates environment variables used on the client side.
 * Only variables with the NEXT_PUBLIC_* prefix are included.
 *
 * Note: These variables are bundled into the client at build time,
 * so they must not contain sensitive information.
 */

import { z } from "zod";

/**
 * Client-side environment variable schema
 *
 * Only includes variables with the NEXT_PUBLIC_* prefix.
 */
export const clientEnvSchema = z.object({
  // AI provider (used on the client)
  NEXT_PUBLIC_DEFAULT_AI_PROVIDER: z
    .enum(["openai", "gemini", "auto"])
    .default("openai"),

  // Site URL (used on the client, optional)
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

/**
 * Client environment variable type
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validate and return client environment variables
 *
 * @throws {Error} If required variables are missing or have invalid format
 */
export function validateClientEnv(): ClientEnv {
  try {
    // Filter only variables with the NEXT_PUBLIC_* prefix
    const clientEnv: Record<string, string | undefined> = {};

    for (const key in process.env) {
      if (key.startsWith("NEXT_PUBLIC_")) {
        clientEnv[key] = process.env[key];
      }
    }

    return clientEnvSchema.parse(clientEnv);
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
          `Missing required client env vars: ${missingVars.join(", ")}`,
        );
      }

      if (invalidVars.length > 0) {
        errorMessages.push(
          `Client env var format errors:\n${invalidVars.join("\n")}`,
        );
      }

      throw new Error(
        `Client environment validation failed:\n${errorMessages.join("\n\n")}\n\n` +
          `Client env vars must have the NEXT_PUBLIC_* prefix.`,
        { cause: error },
      );
    }
    throw error;
  }
}
