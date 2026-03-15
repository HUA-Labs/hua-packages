/**
 * Subscription ↔ UserQuota Sync
 *
 * Syncs subscription lifecycle events to UserQuota limits.
 * - Subscription created/upgraded → update limits from Plan
 * - Subscription cancelled/expired → downgrade to free defaults
 */

import { prisma } from "@/app/lib/infra/prisma";

// Free plan defaults (matching quota.ts + db-quota-store.ts)
const FREE_LIMITS = {
  daily_resource_limit: 3,
  monthly_resource_limit: 50,
  daily_api_limit: 3,
  monthly_api_limit: 50,
} as const;

/**
 * Calculate next reset time based on KST (UTC+9)
 * Same logic as getNextResetTime in db-quota-store.ts
 */
function getNextResetTimeKST(period: "daily" | "monthly"): Date {
  const now = new Date();
  const koreanOffset = 9 * 60 * 60 * 1000;
  const koreanNow = new Date(now.getTime() + koreanOffset);

  if (period === "daily") {
    const y = koreanNow.getUTCFullYear();
    const m = koreanNow.getUTCMonth();
    const d = koreanNow.getUTCDate();
    return new Date(Date.UTC(y, m, d + 1, 0, 0, 0, 0) - koreanOffset);
  } else {
    const y = koreanNow.getUTCFullYear();
    const m = koreanNow.getUTCMonth();
    return new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0) - koreanOffset);
  }
}

/**
 * Sync quota when subscription is created or upgraded.
 * Sets UserQuota limits from the Plan and links subscription.
 */
export async function syncQuotaOnSubscriptionActive(
  userId: string,
  subscriptionId: string,
  planId: string,
): Promise<void> {
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: {
      daily_resource_limit: true,
      monthly_resource_limit: true,
      daily_api_limit: true,
      monthly_api_limit: true,
    },
  });

  if (!plan) return;

  const dailyResetAt = getNextResetTimeKST("daily");
  const monthlyResetAt = getNextResetTimeKST("monthly");

  await prisma.userQuota.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      subscription_id: subscriptionId,
      is_premium: true,
      daily_resource_limit: plan.daily_resource_limit,
      monthly_resource_limit: plan.monthly_resource_limit,
      daily_api_limit: plan.daily_api_limit,
      monthly_api_limit: plan.monthly_api_limit,
      daily_reset_at: dailyResetAt,
      monthly_reset_at: monthlyResetAt,
    },
    update: {
      subscription_id: subscriptionId,
      is_premium: true,
      daily_resource_limit: plan.daily_resource_limit,
      monthly_resource_limit: plan.monthly_resource_limit,
      daily_api_limit: plan.daily_api_limit,
      monthly_api_limit: plan.monthly_api_limit,
    },
  });
}

/**
 * Downgrade quota when subscription is cancelled or expired.
 * Resets limits to free defaults and unlinks subscription.
 */
export async function syncQuotaOnSubscriptionEnd(
  userId: string,
): Promise<void> {
  const quota = await prisma.userQuota.findUnique({
    where: { user_id: userId },
  });

  if (!quota) return;

  await prisma.userQuota.update({
    where: { user_id: userId },
    data: {
      subscription_id: null,
      is_premium: false,
      daily_resource_limit: FREE_LIMITS.daily_resource_limit,
      monthly_resource_limit: FREE_LIMITS.monthly_resource_limit,
      daily_api_limit: FREE_LIMITS.daily_api_limit,
      monthly_api_limit: FREE_LIMITS.monthly_api_limit,
    },
  });
}

/**
 * Process expired trials — downgrade to free.
 * Intended to be called from a cron job.
 */
export async function processExpiredTrials(): Promise<number> {
  const now = new Date();

  const expiredTrials = await prisma.subscription.findMany({
    where: {
      is_trial: true,
      trial_end: { lte: now },
      status: "ACTIVE",
    },
    select: { id: true, user_id: true },
  });

  for (const sub of expiredTrials) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    });

    await syncQuotaOnSubscriptionEnd(sub.user_id);
  }

  return expiredTrials.length;
}
