/**
 * Admin dashboard API
 *
 * GET /api/admin/dashboard
 * - Aggregate stats: users, subscriptions, payments, logins
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { withCache } from "@/app/lib/infra/cache";

export const GET = withAdmin(
  async (request: NextRequest, { userId }) => {
    try {
      const cachedResult = await withCache(
        "admin:dashboard",
        async () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const loginActions = [
            "login_credentials",
            "login_kakao",
            "login_google",
            "login_line",
          ];

          const [
            totalUsers,
            totalSubscriptions,
            todayLoginLogs,
            activeSubscriptions,
          ] = await Promise.all([
            // Total user count
            prisma.user.count(),
            // Total subscription count
            prisma.subscription.count(),
            // Today login/DAU stats
            prisma.loginLog.findMany({
              where: {
                created_at: { gte: today, lt: tomorrow },
                action: { in: loginActions },
                success: { not: false },
              },
              select: { user_id: true },
            }),
            // Active subscriptions
            prisma.subscription.count({ where: { status: "ACTIVE" } }),
          ]);

          const todayLogins = todayLoginLogs.length;
          const dauUserIds = new Set(
            todayLoginLogs.filter((l) => l.user_id).map((l) => l.user_id),
          );
          const dau = dauUserIds.size;

          return {
            totalUsers,
            totalSubscriptions,
            activeSubscriptions,
            todayLogins,
            dau,
          };
        },
        30,
      ); // TTL 30s

      return NextResponse.json(cachedResult);
    } catch (error) {
      console.error("Dashboard data loading error:", error);
      return internalError();
    }
  },
  {
    enableRateLimit: true,
    userLimitPerMinute: 100,
    ipLimitPerMinute: 200,
  },
);
