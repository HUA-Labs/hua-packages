/**
 * Zod schema for server-side environment variable validation
 *
 * Validates environment variables used only on the server side.
 * Contains sensitive information that must not be exposed to the client.
 */

import { z } from "zod";

/**
 * Server-only environment variable schema
 */
export const serverEnvSchema = z.object({
  // Node.js environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL."),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid URL.").optional(),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters.")
    .describe("Secret key for NextAuth session encryption"),
  NEXTAUTH_URL: z
    .string()
    .url("NEXTAUTH_URL must be a valid URL.")
    .default("http://localhost:3000"),

  // Encryption (ENCRYPTION_KEY is optional when using KMS)
  ENCRYPTION_KEY: z
    .string()
    .min(32, "ENCRYPTION_KEY must be at least 32 characters.")
    .optional()
    .describe("Legacy PBKDF2 encryption key (not needed when using KMS)"),

  // GCP KMS (Envelope Encryption)
  GCP_KMS_KEY_NAME: z
    .string()
    .optional()
    .describe(
      "GCP KMS key path (projects/{project}/locations/{location}/keyRings/{ring}/cryptoKeys/{key})",
    ),
  GCP_KMS_CREDENTIALS: z
    .string()
    .optional()
    .describe("GCP service account JSON (base64 encoded)"),

  // Social login (server only)
  KAKAO_CLIENT_ID: z.string().optional(),
  KAKAO_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Stripe (server only)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Paddle (server only)
  PADDLE_API_KEY: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),

  // Other server-only (optional)
  REDIS_URL: z.string().url().optional(),
  AWS_SES_REGION: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_SES_ACCESS_KEY_ID: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SES_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  CONTACT_EMAIL: z.string().email().optional(),
  AWS_SES_FROM_EMAIL: z.string().email().optional(),
  FROM_EMAIL: z.string().email().optional(),
  NOREPLY_EMAIL: z.string().email().optional(),

  // Discord Webhook
  DISCORD_WEBHOOK_CRISIS: z.string().url().optional(),
  DISCORD_WEBHOOK_SYSTEM: z.string().url().optional(),

  // Hackathon (Gemini 3 Seoul, 2025-02-28)
  HACKATHON_API_KEY: z.string().min(32).optional(),
  HACKATHON_ALLOWED_ORIGIN: z.string().url().optional(),
});

/**
 * Server environment variable type
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validate and return server environment variables
 *
 * @throws {Error} If required variables are missing or have invalid format
 */
export function validateServerEnv(): ServerEnv {
  try {
    return serverEnvSchema.parse(process.env);
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
          `Missing required server env vars: ${missingVars.join(", ")}`,
        );
      }

      if (invalidVars.length > 0) {
        errorMessages.push(
          `Server env var format errors:\n${invalidVars.join("\n")}`,
        );
      }

      throw new Error(
        `Server environment validation failed:\n${errorMessages.join("\n\n")}\n\n` +
          `Required server env vars:\n` +
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
