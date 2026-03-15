import { createHash } from "crypto";

/**
 * Advisory Lock Scope for rate limiting
 * Each scope has a different Lock Key generation policy.
 */
export type AdvisoryLockScope = "contact" | "signup" | "password-reset";

/**
 * Parameters for generating an Advisory Lock Key
 */
export interface AdvisoryLockParams {
  scope: AdvisoryLockScope;
  email?: string;
  clientIP?: string;
  userId?: string;
}

/**
 * Generate PostgreSQL Advisory Lock Key
 *
 * PostgreSQL's pg_advisory_xact_lock accepts bigint,
 * so the string combination is hashed with SHA-256 and converted to a number.
 *
 * @param params Lock Key generation parameters
 * @returns Numeric key usable with PostgreSQL Advisory Lock
 *
 * @example
 * ```typescript
 * // Contact Form (email + IP)
 * const key = generateAdvisoryLockKey({
 *   scope: 'contact',
 *   email: 'user@example.com',
 *   clientIP: '127.0.0.1'
 * });
 *
 * // Signup (IP only)
 * const key = generateAdvisoryLockKey({
 *   scope: 'signup',
 *   clientIP: '127.0.0.1'
 * });
 *
 * // Password Reset (email only)
 * const key = generateAdvisoryLockKey({
 *   scope: 'password-reset',
 *   email: 'user@example.com'
 * });
 * ```
 */
export function generateAdvisoryLockKey(params: AdvisoryLockParams): number {
  const { scope, email, clientIP, userId } = params;

  // Generate Lock Key seed per scope
  let lockKeyString: string;

  switch (scope) {
    case "contact":
      // Contact: email:clientIP combination
      if (!email || !clientIP) {
        throw new Error("contact scope requires both email and clientIP");
      }
      lockKeyString = `contact:${email}:${clientIP}`;
      break;

    case "signup":
      // Signup: clientIP only (no email yet)
      if (!clientIP) {
        throw new Error("signup scope requires clientIP");
      }
      lockKeyString = `signup:${clientIP}`;
      break;

    case "password-reset":
      // Password reset: email only
      if (!email) {
        throw new Error("password-reset scope requires email");
      }
      lockKeyString = `password-reset:${email}`;
      break;

    default:
      // Default for future extensions (use userId)
      if (userId) {
        lockKeyString = `${scope}:${userId}`;
      } else if (clientIP) {
        lockKeyString = `${scope}:${clientIP}`;
      } else {
        throw new Error(
          `Invalid scope or missing required parameters: ${scope}`,
        );
      }
  }

  // Generate SHA-256 hash
  const lockKeyHash = createHash("sha256").update(lockKeyString).digest();

  // Convert first 8 bytes of hash to BigInt
  const lockKey = BigInt("0x" + lockKeyHash.subarray(0, 8).toString("hex"));

  // PostgreSQL advisory lock uses signed integer range — adjust accordingly
  // Clamp within Number.MAX_SAFE_INTEGER (2^53 - 1)
  const lockKeyAdjusted = Number(lockKey % BigInt(Number.MAX_SAFE_INTEGER));

  return lockKeyAdjusted;
}
