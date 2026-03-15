import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";

async function handleGetErrorStats(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const total = await prisma.errorLog.count();

    const count24h = await prisma.errorLog.count({
      where: {
        created_at: { gte: last24h },
      },
    });

    const count7d = await prisma.errorLog.count({
      where: {
        created_at: { gte: last7d },
      },
    });

    const severityCounts = await prisma.errorLog.groupBy({
      by: ["severity"],
      where: {
        created_at: { gte: last7d },
      },
      _count: {
        id: true,
      },
    });

    const bySeverity: Record<string, number> = {
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
    };

    severityCounts.forEach((item) => {
      if (item.severity) {
        bySeverity[item.severity] = item._count.id;
      }
    });

    const serviceCounts = await prisma.errorLog.groupBy({
      by: ["service"],
      where: {
        created_at: { gte: last7d },
      },
      _count: {
        id: true,
      },
    });

    const byService: Record<string, number> = {};
    serviceCounts.forEach((item) => {
      if (item.service) {
        byService[item.service] = item._count.id;
      }
    });

    return NextResponse.json({
      total,
      last24h: count24h,
      last7d: count7d,
      bySeverity,
      byService,
    });
  } catch (error) {
    console.error("Error fetching error stats:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetErrorStats);
