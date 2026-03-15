/**
 * Login statistics API
 *
 * GET /api/admin/dashboard/login-stats?period=day|week|month
 * - DAU/MAU, login trends, provider/device distribution, success/failure rates
 */

import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const GET = withAdmin(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const period = searchParams.get("period") || "week";

      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let startDate: Date;
      switch (period) {
        case "day":
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "month":
          startDate = new Date(today);
          startDate.setMonth(startDate.getMonth() - 12);
          break;
        case "week":
        default:
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 84);
          break;
      }

      const loginLogs = await prisma.loginLog.findMany({
        where: {
          created_at: { gte: startDate },
        },
        select: {
          user_id: true,
          action: true,
          device: true,
          success: true,
          created_at: true,
        },
        orderBy: { created_at: "asc" },
      });

      const loginActions = [
        "login_credentials",
        "login_kakao",
        "login_google",
        "login_line",
      ];
      const signupActions = ["signup", "signup_social"];

      const totalLogins = loginLogs.filter(
        (l) => loginActions.includes(l.action || "") && l.success !== false,
      ).length;
      const failedLogins = loginLogs.filter(
        (l) => l.action === "login_failed" || l.success === false,
      ).length;
      const signups = loginLogs.filter((l) =>
        signupActions.includes(l.action || ""),
      ).length;

      const uniqueUserIds = new Set(
        loginLogs
          .filter(
            (l) =>
              l.user_id &&
              loginActions.includes(l.action || "") &&
              l.success !== false,
          )
          .map((l) => l.user_id),
      );
      const uniqueUsers = uniqueUserIds.size;

      const todayLogs = loginLogs.filter(
        (l) => l.created_at >= today && l.created_at < tomorrow,
      );
      const dauUserIds = new Set(
        todayLogs
          .filter(
            (l) =>
              l.user_id &&
              loginActions.includes(l.action || "") &&
              l.success !== false,
          )
          .map((l) => l.user_id),
      );
      const dau = dauUserIds.size;

      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const mauUserIds = new Set(
        loginLogs
          .filter(
            (l) =>
              l.user_id &&
              l.created_at >= thirtyDaysAgo &&
              loginActions.includes(l.action || "") &&
              l.success !== false,
          )
          .map((l) => l.user_id),
      );
      const mau = mauUserIds.size;
      const dauMauRatio = mau > 0 ? ((dau / mau) * 100).toFixed(1) + "%" : "0%";

      const dailyLoginMap: Record<string, number> = {};
      const dailyUniqueMap: Record<string, Set<string>> = {};

      loginLogs
        .filter(
          (l) => loginActions.includes(l.action || "") && l.success !== false,
        )
        .forEach((l) => {
          const dateStr = toDateString(l.created_at);
          dailyLoginMap[dateStr] = (dailyLoginMap[dateStr] || 0) + 1;
          if (l.user_id) {
            if (!dailyUniqueMap[dateStr]) dailyUniqueMap[dateStr] = new Set();
            dailyUniqueMap[dateStr].add(l.user_id);
          }
        });

      const trendLogins: { date: string; count: number }[] = [];
      const trendUniqueUsers: { date: string; count: number }[] = [];

      if (period === "day") {
        const cur = new Date(startDate);
        while (cur <= today) {
          const ds = toDateString(cur);
          trendLogins.push({ date: ds, count: dailyLoginMap[ds] || 0 });
          trendUniqueUsers.push({
            date: ds,
            count: dailyUniqueMap[ds]?.size || 0,
          });
          cur.setDate(cur.getDate() + 1);
        }
      } else if (period === "week") {
        const cur = new Date(startDate);
        const dayOfWeek = cur.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        cur.setDate(cur.getDate() - diff);

        while (cur <= today) {
          const weekEnd = new Date(cur);
          weekEnd.setDate(weekEnd.getDate() + 6);
          const weekLabel = toDateString(cur);
          let weekLogins = 0;
          const weekUsers = new Set<string>();

          for (
            let d = new Date(cur);
            d <= weekEnd && d <= today;
            d.setDate(d.getDate() + 1)
          ) {
            const ds = toDateString(d);
            weekLogins += dailyLoginMap[ds] || 0;
            dailyUniqueMap[ds]?.forEach((uid) => weekUsers.add(uid));
          }

          trendLogins.push({ date: weekLabel, count: weekLogins });
          trendUniqueUsers.push({ date: weekLabel, count: weekUsers.size });
          cur.setDate(cur.getDate() + 7);
        }
      } else {
        const cur = new Date(startDate);
        cur.setDate(1);

        while (cur <= today) {
          const monthLabel = `${cur.getFullYear()}-${(cur.getMonth() + 1).toString().padStart(2, "0")}`;
          let monthLogins = 0;
          const monthUsers = new Set<string>();

          const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
          for (
            let d = new Date(cur);
            d <= monthEnd && d <= today;
            d.setDate(d.getDate() + 1)
          ) {
            const ds = toDateString(d);
            monthLogins += dailyLoginMap[ds] || 0;
            dailyUniqueMap[ds]?.forEach((uid) => monthUsers.add(uid));
          }

          trendLogins.push({ date: monthLabel, count: monthLogins });
          trendUniqueUsers.push({ date: monthLabel, count: monthUsers.size });
          cur.setMonth(cur.getMonth() + 1);
        }
      }

      const providerMap: Record<string, number> = {};
      loginLogs
        .filter(
          (l) => loginActions.includes(l.action || "") && l.success !== false,
        )
        .forEach((l) => {
          const provider = (l.action || "").replace("login_", "");
          providerMap[provider] = (providerMap[provider] || 0) + 1;
        });
      const totalByProvider = Object.values(providerMap).reduce(
        (a, b) => a + b,
        0,
      );
      const byProvider = Object.entries(providerMap).map(
        ([provider, count]) => ({
          provider,
          count,
          percentage:
            totalByProvider > 0
              ? ((count / totalByProvider) * 100).toFixed(1) + "%"
              : "0%",
        }),
      );

      const deviceMap: Record<string, number> = {};
      loginLogs
        .filter(
          (l) => loginActions.includes(l.action || "") && l.success !== false,
        )
        .forEach((l) => {
          const device = l.device || "unknown";
          deviceMap[device] = (deviceMap[device] || 0) + 1;
        });
      const byDevice = Object.entries(deviceMap).map(([device, count]) => ({
        device,
        count,
      }));

      const successCount = totalLogins;
      const successRate =
        successCount + failedLogins > 0
          ? ((successCount / (successCount + failedLogins)) * 100).toFixed(1) +
            "%"
          : "100%";

      let longTermTrend: any[] = [];
      try {
        longTermTrend = await prisma.monthlyAccessStats.findMany({
          orderBy: { period: "asc" },
          select: {
            period: true,
            total_logins: true,
            unique_users: true,
            failed_logins: true,
            signups: true,
            avg_dau: true,
            peak_dau: true,
            by_provider: true,
            by_device: true,
          },
        });
      } catch {
        // MonthlyAccessStats table may not exist yet
      }

      return NextResponse.json({
        period,
        summary: {
          totalLogins,
          uniqueUsers,
          failedLogins,
          signups,
          dau,
          mau,
          dauMauRatio,
        },
        trends: {
          logins: trendLogins,
          uniqueUsers: trendUniqueUsers,
        },
        byProvider,
        byDevice,
        successRate: {
          success: successCount,
          failed: failedLogins,
          rate: successRate,
        },
        longTermTrend,
      });
    } catch (error) {
      console.error("Login stats fetch error:", error);
      return internalError();
    }
  },
  {
    enableRateLimit: true,
    userLimitPerMinute: 60,
    ipLimitPerMinute: 120,
  },
);
