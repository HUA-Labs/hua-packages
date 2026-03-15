/**
 * Quota check and management helper functions
 *
 * Single quota system for submissions
 */

import { QuotaData } from "./store/interface";
import { quotaStore } from "./store/db-quota-store";
import { prisma } from "../infra/prisma";

/**
 * Quota check result
 */
export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check quota (returns result without throwing)
 */
export async function checkUserQuota(
  userId: string,
  period: "daily" | "monthly" = "daily",
): Promise<QuotaCheckResult> {
  // Use getUserQuotaLimits to get accurate values
  const limits = await getUserQuotaLimits(userId);
  const quota = period === "daily" ? limits.daily : limits.monthly;

  return {
    allowed: quota.count < quota.limit,
    remaining: Math.max(0, quota.limit - quota.count),
    resetAt: quota.resetAt,
  };
}

/**
 * Check quota (throws on exceeded)
 */
export async function checkQuotaOrThrow(
  userId: string,
  period: "daily" | "monthly" = "daily",
): Promise<void> {
  const result = await checkUserQuota(userId, period);

  if (!result.allowed) {
    const periodText = period === "daily" ? "Daily" : "Monthly";
    throw new QuotaExceededError(
      `${periodText} submission limit exceeded.`,
      result,
    );
  }
}

/**
 * Increment quota
 */
export async function incrementUserQuota(
  userId: string,
  period: "daily" | "monthly" = "daily",
): Promise<void> {
  await quotaStore.increment(userId, period);
}

/**
 * Check whether a user is premium
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const quota = await prisma.userQuota.findUnique({
    where: { user_id: userId },
    select: { is_premium: true },
  });

  return quota?.is_premium ?? false;
}

// Default limits (fallback when no plan-specific values in UserQuota)
const DEFAULT_FREE_DAILY = 3;
const DEFAULT_FREE_MONTHLY = 50;
const DEFAULT_PREMIUM_DAILY = 20;
const DEFAULT_PREMIUM_MONTHLY = 500;

/**
 * Get user quota limits (reflects premium and guest status)
 *
 * Uses plan-specific limits stored in UserQuota if available,
 * otherwise falls back to defaults.
 */
export async function getUserQuotaLimits(userId: string): Promise<{
  daily: { limit: number; count: number; resetAt: Date };
  monthly: { limit: number; count: number; resetAt: Date };
}> {
  // Fetch user info, UserQuota, and counts in parallel
  const [user, userQuota, daily, monthly] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email_hash: true, role: true },
    }),
    prisma.userQuota.findUnique({
      where: { user_id: userId },
      select: {
        is_premium: true,
        daily_api_limit: true,
        monthly_api_limit: true,
      },
    }),
    quotaStore.get(userId, "daily"),
    quotaStore.get(userId, "monthly"),
  ]);

  // Determine admin/guest/premium status
  const isAdmin = user?.role === "ADMIN";
  const isGuest = !isAdmin && !user?.email_hash;
  const isPremium = userQuota?.is_premium ?? false;

  // Determine limits: DB-stored value > default fallback
  let dailyLimit: number;
  let monthlyLimit: number;

  if (isAdmin) {
    dailyLimit = 999999;
    monthlyLimit = 999999;
  } else if (isGuest) {
    dailyLimit = 3;
    monthlyLimit = 999999;
  } else if (isPremium && userQuota) {
    // Plan-specific DB value takes priority; fall back to premium defaults
    dailyLimit = userQuota.daily_api_limit ?? DEFAULT_PREMIUM_DAILY;
    monthlyLimit = userQuota.monthly_api_limit ?? DEFAULT_PREMIUM_MONTHLY;
  } else {
    dailyLimit = DEFAULT_FREE_DAILY;
    monthlyLimit = DEFAULT_FREE_MONTHLY;
  }

  return {
    daily: {
      limit: dailyLimit,
      count: daily.count,
      resetAt: daily.reset_at,
    },
    monthly: {
      limit: monthlyLimit,
      count: monthly.count,
      resetAt: monthly.reset_at,
    },
  };
}

/**
 * Quota exceeded error
 */
export class QuotaExceededError extends Error {
  constructor(
    message: string,
    public readonly quota: QuotaCheckResult,
  ) {
    super(message);
    this.name = "QuotaExceededError";
  }
}
