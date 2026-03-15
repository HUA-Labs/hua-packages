/**
 * Unified quota check function
 *
 * Checks all limits at once at submission time
 * - Rate Limit
 * - Quota check
 */

import {
  checkRateLimit,
  RateLimitExceededError,
} from "../rate-limit/rate-limit";
import { checkQuotaOrThrow, QuotaExceededError } from "./quota";
import { checkAdminPermission } from "../admin/admin";

/**
 * Unified limit check
 *
 * @param userId User ID
 * @param ip IP address
 * @param userAgent User-Agent (optional, for VPN/mobile detection)
 */
export async function checkAllLimits(
  userId: string,
  ip: string,
  userAgent?: string | null,
): Promise<void> {
  // Admin check (admins skip all limits)
  const isAdmin = await checkAdminPermission(userId);
  if (isAdmin) {
    return;
  }

  // Run all checks in parallel
  const [rateLimit, limits] = await Promise.all([
    checkRateLimit(userId, ip, userAgent),
    import("./quota").then((m) => m.getUserQuotaLimits(userId)),
  ]);

  // 1. Rate limit check
  if (!rateLimit.allowed) {
    throw new RateLimitExceededError(
      "Too many requests. Please try again later.",
      rateLimit.resetAt,
    );
  }

  // 2. Quota check (daily/monthly)
  if (limits.daily.count >= limits.daily.limit) {
    throw new QuotaExceededError("Daily limit exceeded.", {
      allowed: false,
      remaining: 0,
      resetAt: limits.daily.resetAt,
    });
  }

  if (limits.monthly.count >= limits.monthly.limit) {
    throw new QuotaExceededError("Monthly limit exceeded.", {
      allowed: false,
      remaining: 0,
      resetAt: limits.monthly.resetAt,
    });
  }
}
