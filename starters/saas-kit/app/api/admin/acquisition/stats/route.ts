import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { withCache } from "@/app/lib/infra/cache";

/**
 * GET /api/admin/acquisition/stats
 * UTM acquisition tracking statistics
 */
export const GET = withAdmin(
  async (request: NextRequest, { userId }) => {
    try {
      const cachedResult = await withCache(
        "admin:acquisition:stats",
        async () => {
          const [totalTracked, records, topSources, topMediums, topCampaigns] =
            await Promise.all([
              // Total tracked users
              prisma.userAcquisition.count(),
              // Recent 50 records
              prisma.userAcquisition.findMany({
                take: 50,
                orderBy: { created_at: "desc" },
                select: {
                  id: true,
                  utm_source: true,
                  utm_medium: true,
                  utm_campaign: true,
                  referrer: true,
                  landing_url: true,
                  created_at: true,
                },
              }),
              // Top sources (groupBy)
              prisma.userAcquisition.groupBy({
                by: ["utm_source"],
                where: { utm_source: { not: null } },
                _count: true,
                orderBy: { _count: { utm_source: "desc" } },
                take: 10,
              }),
              // Top mediums
              prisma.userAcquisition.groupBy({
                by: ["utm_medium"],
                where: { utm_medium: { not: null } },
                _count: true,
                orderBy: { _count: { utm_medium: "desc" } },
                take: 10,
              }),
              // Top campaigns
              prisma.userAcquisition.groupBy({
                by: ["utm_campaign"],
                where: { utm_campaign: { not: null } },
                _count: true,
                orderBy: { _count: { utm_campaign: "desc" } },
                take: 10,
              }),
            ]);

          return {
            totalTracked,
            topSource: topSources[0]?.utm_source || "-",
            topSources: topSources.map((s) => ({
              name: s.utm_source,
              count: s._count,
            })),
            topMediums: topMediums.map((m) => ({
              name: m.utm_medium,
              count: m._count,
            })),
            topCampaigns: topCampaigns.map((c) => ({
              name: c.utm_campaign,
              count: c._count,
            })),
            records,
          };
        },
        30,
      ); // 30s cache

      return NextResponse.json(cachedResult);
    } catch (error) {
      console.error("[admin/acquisition/stats] error:", error);
      return internalError();
    }
  },
  {
    enableRateLimit: true,
    userLimitPerMinute: 60,
    ipLimitPerMinute: 100,
  },
);
