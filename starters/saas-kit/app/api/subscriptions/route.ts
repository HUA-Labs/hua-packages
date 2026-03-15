/**
 * GET /api/subscriptions
 *
 * Returns the current user's subscription info.
 */

import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { apiError, unauthorized } from "@/app/lib/errors";
import { withRateLimit } from "@/app/lib/rate-limit/with-rate-limit";

export const GET = withRateLimit(async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const subscription = await prisma.subscription.findUnique({
      where: { user_id: session.user.id },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        provider: subscription.provider,
        billingCycle: subscription.billing_cycle,
        amount: subscription.amount,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAt: subscription.cancel_at,
        isTrial: subscription.is_trial,
        trialEnd: subscription.trial_end,
        plan: {
          id: subscription.plan.id,
          name: subscription.plan.name,
          displayName: subscription.plan.display_name,
        },
      },
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return apiError("INTERNAL_ERROR");
  }
});
