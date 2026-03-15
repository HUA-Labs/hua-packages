import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";

async function handleGetSubscriptions(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(
      1,
      Math.min(1000, parseInt(searchParams.get("page") || "1") || 1),
    );
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") || "20") || 20),
    );
    const status = searchParams.get("status");
    const provider = searchParams.get("provider");
    const billingCycle = searchParams.get("billing_cycle");
    const isTrial = searchParams.get("is_trial");

    const where: any = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;
    if (billingCycle) where.billing_cycle = billingCycle;
    if (isTrial === "true") where.is_trial = true;
    if (isTrial === "false") where.is_trial = false;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, email_hash: true, nickname_hash: true } },
          plan: { select: { display_name: true, name: true } },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return NextResponse.json({
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        user: {
          id: s.user.id,
          email_hash: s.user.email_hash,
          nickname_hash: s.user.nickname_hash,
        },
        plan: s.plan
          ? { display_name: s.plan.display_name, name: s.plan.name }
          : null,
        status: s.status,
        provider: s.provider,
        billing_cycle: s.billing_cycle,
        amount: Number(s.amount),
        currency: s.currency,
        is_trial: s.is_trial,
        started_at: s.started_at,
        current_period_start: s.current_period_start,
        current_period_end: s.current_period_end,
        cancel_at: s.cancel_at,
        auto_renew: s.auto_renew,
        created_at: s.created_at,
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetSubscriptions);
