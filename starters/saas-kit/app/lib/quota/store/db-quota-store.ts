/**
 * DB-based QuotaStore implementation
 *
 * Currently queries DB directly (beta phase)
 * Uses abstraction layer to allow future migration to Redis
 */

import { QuotaStore, QuotaData } from "./interface";

import { prisma } from "../../infra/prisma";

export class DBQuotaStore implements QuotaStore {
  /**
   * Get user quota info
   */
  async get(userId: string, period: "daily" | "monthly"): Promise<QuotaData> {
    const quota = await prisma.userQuota.findUnique({
      where: { user_id: userId },
    });

    if (!quota) {
      // Initialize if quota doesn't exist
      return await this.initializeQuota(userId, period);
    }

    // Check reset time (based on Korean time)
    const resetAt =
      period === "daily" ? quota.daily_reset_at : quota.monthly_reset_at;
    const now = new Date(); // Current time in UTC

    // If reset time has passed, reset and return immediately (no re-query)
    if (resetAt < now) {
      const newResetAt = this.getNextResetTime(period);
      await this.resetAndReturn(userId, period, newResetAt);

      const limit =
        period === "daily"
          ? (quota.daily_resource_limit ?? 10)
          : (quota.monthly_resource_limit ?? 300);

      return {
        count: 0, // 0 after reset
        limit: Number(limit),
        reset_at: newResetAt,
      };
    }

    const count =
      period === "daily"
        ? (quota.daily_resource_count ?? 0)
        : (quota.monthly_resource_count ?? 0);

    const limit =
      period === "daily"
        ? (quota.daily_resource_limit ?? 10)
        : (quota.monthly_resource_limit ?? 300);

    return {
      count: Number(count),
      limit: Number(limit),
      reset_at: resetAt,
    };
  }

  /**
   * Return after reset without re-query (performance optimization)
   */
  private async resetAndReturn(
    userId: string,
    period: "daily" | "monthly",
    resetAt: Date,
  ): Promise<void> {
    const updateData: any = {
      [period === "daily" ? "daily_resource_count" : "monthly_resource_count"]:
        0,
      [period === "daily" ? "daily_reset_at" : "monthly_reset_at"]: resetAt,
    };

    await prisma.userQuota.update({
      where: { user_id: userId },
      data: updateData,
    });
  }

  /**
   * Increment user quota (transaction ensures concurrency safety)
   */
  async increment(userId: string, period: "daily" | "monthly"): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const quota = await tx.userQuota.findUnique({
        where: { user_id: userId },
      });

      if (!quota) {
        // Initialize then increment if quota doesn't exist
        await this.initializeQuota(userId, period);
        await tx.userQuota.update({
          where: { user_id: userId },
          data: {
            [period === "daily"
              ? "daily_resource_count"
              : "monthly_resource_count"]: { increment: 1 },
          },
        });
        return;
      }

      // Check reset time (based on Korean time)
      const resetAt =
        period === "daily" ? quota.daily_reset_at : quota.monthly_reset_at;
      const now = new Date(); // Current time (UTC)

      // Reset then increment if reset time has passed
      if (resetAt < now) {
        await this.reset(userId, period);
      }

      const updateField =
        period === "daily" ? "daily_resource_count" : "monthly_resource_count";

      await tx.userQuota.update({
        where: { user_id: userId },
        data: {
          [updateField]: { increment: 1 },
        },
      });
    });
  }

  /**
   * Reset user quota
   */
  async reset(userId: string, period: "daily" | "monthly"): Promise<void> {
    const resetAt = this.getNextResetTime(period);

    const updateData: any = {
      [period === "daily" ? "daily_resource_count" : "monthly_resource_count"]:
        0,
      [period === "daily" ? "daily_reset_at" : "monthly_reset_at"]: resetAt,
    };

    await prisma.userQuota.update({
      where: { user_id: userId },
      data: updateData,
    });
  }

  /**
   * Initialize quota (when not exists)
   */
  private async initializeQuota(
    userId: string,
    period: "daily" | "monthly",
  ): Promise<QuotaData> {
    const resetAt = this.getNextResetTime(period);
    const defaultLimit = period === "daily" ? 3 : 50;

    // Create or update with upsert and return result directly (no re-query)
    const quota = await prisma.userQuota.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        daily_resource_limit: 3,
        monthly_resource_limit: 50,
        daily_resource_count: 0,
        monthly_resource_count: 0,
        daily_api_limit: 3,
        monthly_api_limit: 50,
        daily_api_count: 0,
        monthly_api_count: 0,
        daily_reset_at: this.getNextResetTime("daily"),
        monthly_reset_at: this.getNextResetTime("monthly"),
        is_premium: false,
      },
      update: {
        [period === "daily" ? "daily_reset_at" : "monthly_reset_at"]: resetAt,
      },
    });

    const count =
      period === "daily"
        ? quota.daily_resource_count
        : quota.monthly_resource_count;

    const limit =
      period === "daily"
        ? quota.daily_resource_limit
        : quota.monthly_resource_limit;

    return {
      count: count ?? 0,
      limit: limit ?? defaultLimit,
      reset_at:
        period === "daily" ? quota.daily_reset_at : quota.monthly_reset_at,
    };
  }

  /**
   * Calculate next reset time (based on Korean time)
   *
   * Stored as UTC in DB — converts Korean midnight to UTC
   */
  private getNextResetTime(period: "daily" | "monthly"): Date {
    const now = new Date();
    const koreanOffset = 9 * 60 * 60 * 1000; // 9 hours (milliseconds)
    const koreanNow = new Date(now.getTime() + koreanOffset);

    if (period === "daily") {
      const koreanYear = koreanNow.getUTCFullYear();
      const koreanMonth = koreanNow.getUTCMonth();
      const koreanDate = koreanNow.getUTCDate();

      // Tomorrow midnight (Korean time) → convert to UTC
      const koreanTomorrowMidnight = Date.UTC(
        koreanYear,
        koreanMonth,
        koreanDate + 1,
        0,
        0,
        0,
        0,
      );
      return new Date(koreanTomorrowMidnight - koreanOffset);
    } else {
      const koreanYear = koreanNow.getUTCFullYear();
      const koreanMonth = koreanNow.getUTCMonth();

      // First day of next month midnight (Korean time) → convert to UTC
      const koreanNextMonthMidnight = Date.UTC(
        koreanYear,
        koreanMonth + 1,
        1,
        0,
        0,
        0,
        0,
      );
      return new Date(koreanNextMonthMidnight - koreanOffset);
    }
  }
}

// Singleton instance
export const quotaStore = new DBQuotaStore();
