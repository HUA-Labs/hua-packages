/**
 * Abuse detection alert statistics API
 *
 * GET: Abuse alert statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function handleGetAbuseAlertStats(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const totalCount = await prisma.abuseAlert.count();

    const statusStats = await prisma.abuseAlert.groupBy({
      by: ["status"],
      _count: true,
    });

    const alertTypeStats = await prisma.abuseAlert.groupBy({
      by: ["alert_type"],
      _count: true,
    });

    const allAlerts = await prisma.abuseAlert.findMany({
      select: {
        abuse_patterns: true,
      },
    });

    const patternStats: Record<string, number> = {};
    allAlerts.forEach((alert) => {
      alert.abuse_patterns.forEach((pattern: string) => {
        patternStats[pattern] = (patternStats[pattern] || 0) + 1;
      });
    });

    const penaltyLevelStats = await prisma.abuseAlert.groupBy({
      by: ["penalty_level"],
      _count: true,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAlerts = await prisma.abuseAlert.findMany({
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        created_at: true,
        status: true,
      },
    });

    const dailyStats: Record<
      string,
      { total: number; pending: number; actionTaken: number }
    > = {};
    recentAlerts.forEach((alert) => {
      const date = toDateKey(new Date(alert.created_at));
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, pending: 0, actionTaken: 0 };
      }
      dailyStats[date].total++;
      if (alert.status === "PENDING") {
        dailyStats[date].pending++;
      }
      if (alert.status === "ACTION_TAKEN") {
        dailyStats[date].actionTaken++;
      }
    });

    const processedAlerts = await prisma.abuseAlert.findMany({
      where: {
        reviewed_at: {
          not: null,
        },
      },
      select: {
        created_at: true,
        reviewed_at: true,
      },
    });

    const processingTimes = processedAlerts
      .map((alert) => {
        if (!alert.reviewed_at) return null;
        return (
          new Date(alert.reviewed_at).getTime() -
          new Date(alert.created_at).getTime()
        );
      })
      .filter((time): time is number => time !== null);

    const avgProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0;

    return NextResponse.json({
      total: totalCount,
      byStatus: statusStats.reduce(
        (acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byAlertType: alertTypeStats.reduce(
        (acc, stat) => {
          acc[stat.alert_type] = stat._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byPattern: patternStats,
      byPenaltyLevel: penaltyLevelStats.reduce(
        (acc, stat) => {
          acc[stat.penalty_level] = stat._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      dailyTrend: dailyStats,
      avgProcessingTimeMs: avgProcessingTime,
      avgProcessingTimeHours: avgProcessingTime / (1000 * 60 * 60),
    });
  } catch (error) {
    console.error("Abuse alert stats fetch failed:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetAbuseAlertStats);
