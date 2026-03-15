/**
 * Admin dashboard chart data API
 *
 * GET /api/admin/dashboard/charts
 * - User growth trend (daily/weekly/monthly)
 * - Login trend
 * - Abuse alert trend
 */

import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";
import { withCache } from "@/app/lib/infra/cache";

async function handleGetDashboardCharts(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "week";

    const cachedResult = await withCache(
      `admin:charts:${period}`,
      async () => {
        const now = new Date();
        let startDate: Date;
        let groupByFormat: string;

        switch (period) {
          case "day":
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 30);
            groupByFormat = "YYYY-MM-DD";
            break;
          case "week":
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 84);
            groupByFormat = "YYYY-[W]WW";
            break;
          case "month":
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 12);
            groupByFormat = "YYYY-MM";
            break;
          default:
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 84);
            groupByFormat = "YYYY-[W]WW";
        }

        const loginActions = [
          "login_credentials",
          "login_kakao",
          "login_google",
          "login_line",
        ];

        const [users, abuseAlerts, loginLogs] = await Promise.all([
          prisma.user.findMany({
            where: { created_at: { gte: startDate } },
            select: { created_at: true },
            orderBy: { created_at: "asc" },
          }),
          prisma.abuseAlert.findMany({
            where: { created_at: { gte: startDate } },
            select: { created_at: true },
            orderBy: { created_at: "asc" },
          }),
          prisma.loginLog.findMany({
            where: {
              created_at: { gte: startDate },
              action: { in: loginActions },
              success: { not: false },
            },
            select: { created_at: true },
            orderBy: { created_at: "asc" },
          }),
        ]);

        const getISOWeek = (date: Date): number => {
          const d = new Date(
            Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
          );
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          return Math.ceil(
            ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
          );
        };

        const formatLocalDate = (date: Date, format: string): string => {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");

          if (format === "YYYY-MM-DD") {
            return `${year}-${month}-${day}`;
          } else if (format === "YYYY-[W]WW") {
            const week = getISOWeek(date);
            return `${year}-W${week.toString().padStart(2, "0")}`;
          } else if (format === "YYYY-MM") {
            return `${year}-${month}`;
          } else {
            return `${year}-${month}-${day}`;
          }
        };

        const groupByDate = (items: { created_at: Date }[], format: string) => {
          const grouped: Record<string, number> = {};
          items.forEach((item) => {
            const date = new Date(item.created_at);
            const key = formatLocalDate(date, format);
            grouped[key] = (grouped[key] || 0) + 1;
          });
          return grouped;
        };

        const userTrend = groupByDate(users, groupByFormat);
        const abuseTrend = groupByDate(abuseAlerts, groupByFormat);
        const loginTrend = groupByDate(loginLogs, groupByFormat);

        const dateRange: string[] = [];
        const current = new Date(startDate);
        current.setHours(0, 0, 0, 0);
        const endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        while (current <= endDate) {
          const key = formatLocalDate(current, groupByFormat);
          if (!dateRange.includes(key)) {
            dateRange.push(key);
          }
          if (groupByFormat === "YYYY-MM-DD") {
            current.setDate(current.getDate() + 1);
          } else if (groupByFormat === "YYYY-[W]WW") {
            current.setDate(current.getDate() + 7);
          } else if (groupByFormat === "YYYY-MM") {
            current.setMonth(current.getMonth() + 1);
          } else {
            current.setDate(current.getDate() + 1);
          }
        }

        const sortedDateRange = [...new Set(dateRange)].sort();

        return {
          period,
          dateRange: sortedDateRange,
          trends: {
            users: sortedDateRange.map((date) => ({
              date,
              count: userTrend[date] || 0,
            })),
            abuseAlerts: sortedDateRange.map((date) => ({
              date,
              count: abuseTrend[date] || 0,
            })),
            logins: sortedDateRange.map((date) => ({
              date,
              count: loginTrend[date] || 0,
            })),
          },
        };
      },
      120,
    ); // TTL 120s

    return NextResponse.json(cachedResult);
  } catch (error) {
    console.error("Chart data loading error:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetDashboardCharts);
