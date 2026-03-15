import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";

async function handleGetPerformance(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "24h"; // 1h, 24h, 7d, 30d
    const service = searchParams.get("service");

    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "1h":
        startDate.setHours(now.getHours() - 1);
        break;
      case "24h":
        startDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 1);
    }

    const where: any = {
      created_at: {
        gte: startDate,
      },
    };

    if (service) {
      where.service = service;
    }

    const apiLogs = await prisma.apiLog.findMany({
      where,
      select: {
        status_code: true,
        latency_ms: true,
        created_at: true,
        endpoint: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    type ApiLogType = {
      status_code: number | null;
      latency_ms: number | null;
      created_at: Date;
      endpoint: string | null;
    };

    type HourlyStats = {
      requests: number;
      avgLatency: number;
      errors: number;
    };

    const totalRequests = apiLogs.length;
    const successfulRequests = apiLogs.filter(
      (log: ApiLogType) => log.status_code && log.status_code < 400,
    ).length;
    const errorRequests = apiLogs.filter(
      (log: ApiLogType) => log.status_code && log.status_code >= 400,
    ).length;

    const avgLatency =
      apiLogs.length > 0
        ? apiLogs.reduce(
            (sum: number, log: ApiLogType) => sum + (log.latency_ms || 0),
            0,
          ) / apiLogs.length
        : 0;

    const successRate =
      totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    const errorRate =
      totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

    const hourlyStats = apiLogs.reduce(
      (acc: Record<number, HourlyStats>, log: ApiLogType) => {
        const hour = new Date(log.created_at).getHours();
        if (!acc[hour]) {
          acc[hour] = { requests: 0, avgLatency: 0, errors: 0 };
        }
        acc[hour].requests++;
        acc[hour].avgLatency += log.latency_ms || 0;
        if (log.status_code && log.status_code >= 400) {
          acc[hour].errors++;
        }
        return acc;
      },
      {} as Record<number, HourlyStats>,
    );

    Object.keys(hourlyStats).forEach((hour) => {
      const stats = hourlyStats[parseInt(hour)];
      stats.avgLatency =
        stats.requests > 0 ? stats.avgLatency / stats.requests : 0;
    });

    return NextResponse.json({
      summary: {
        totalRequests,
        successfulRequests,
        errorRequests,
        avgLatency: Math.round(avgLatency),
        successRate: Math.round(successRate * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
      },
      hourlyStats,
      period,
      service,
    });
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetPerformance);
