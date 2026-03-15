import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";

async function handleGetStats(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const now = new Date();
    // KST-based current time and month start
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const kstYear = kstNow.getUTCFullYear();
    const kstMonth = kstNow.getUTCMonth();
    const startOfMonth = new Date(
      `${kstYear}-${String(kstMonth + 1).padStart(2, "0")}-01T00:00:00+09:00`,
    );

    const [
      totalRevenueByCurrency,
      monthlyRevenueByCurrency,
      activeSubscriptions,
      trialCount,
      cancelledCount,
      providerBreakdown,
      recentPayments,
    ] = await Promise.all([
      // Total revenue grouped by currency
      prisma.payment.groupBy({
        by: ["currency"],
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      // Monthly revenue grouped by currency
      prisma.payment.groupBy({
        by: ["currency"],
        where: { status: "SUCCESS", created_at: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      // Active subscriptions
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      // Trial subscriptions
      prisma.subscription.count({
        where: { is_trial: true, status: "ACTIVE" },
      }),
      // Cancelled + Expired
      prisma.subscription.count({
        where: { status: { in: ["CANCELLED", "EXPIRED"] } },
      }),
      // Provider breakdown
      prisma.payment.groupBy({
        by: ["provider"],
        where: { status: "SUCCESS" },
        _count: true,
      }),
      // Recent 5 payments with user info
      prisma.payment.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          user: { select: { id: true, email_hash: true, nickname_hash: true } },
        },
      }),
    ]);

    const providerMap: Record<string, number> = {};
    for (const p of providerBreakdown) {
      if (p.provider) providerMap[p.provider.toLowerCase()] = p._count;
    }

    const toRevenueMap = (groups: typeof totalRevenueByCurrency) => {
      const map: Record<string, number> = {};
      for (const g of groups) {
        map[g.currency] = Number(g._sum.amount ?? 0);
      }
      return map;
    };

    return NextResponse.json({
      totalRevenue: toRevenueMap(totalRevenueByCurrency),
      monthlyRevenue: toRevenueMap(monthlyRevenueByCurrency),
      activeSubscriptions,
      trialCount,
      cancelledCount,
      providerBreakdown: {
        toss: providerMap["toss"] ?? 0,
        lemonsqueezy: providerMap["lemonsqueezy"] ?? 0,
      },
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        provider: p.provider,
        method: p.method,
        created_at: p.created_at,
        paid_at: p.paid_at,
        user: p.user
          ? {
              id: p.user.id,
              email_hash: p.user.email_hash,
              nickname_hash: p.user.nickname_hash,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetStats);
