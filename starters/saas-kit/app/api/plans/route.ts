/**
 * GET /api/plans
 *
 * Returns all active, public plans.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import { apiError } from "@/app/lib/errors";
import { withRateLimit } from "@/app/lib/rate-limit/with-rate-limit";

export const GET = withRateLimit(async () => {
  try {
    const plans = await prisma.plan.findMany({
      where: { is_active: true, is_public: true },
      orderBy: { sort_order: "asc" },
      select: {
        id: true,
        name: true,
        display_name: true,
        description: true,
        daily_resource_limit: true,
        monthly_resource_limit: true,
        daily_api_limit: true,
        monthly_api_limit: true,
        price_monthly: true,
        price_yearly: true,
        price_monthly_usd: true,
        price_yearly_usd: true,
        features: true,
        sort_order: true,
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Plans fetch error:", error);
    return apiError("INTERNAL_ERROR");
  }
});
