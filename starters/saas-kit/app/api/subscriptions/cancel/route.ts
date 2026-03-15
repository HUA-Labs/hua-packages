/**
 * POST /api/subscriptions/cancel
 *
 * Cancels the current user's subscription.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { apiError, unauthorized, validationError } from "@/app/lib/errors";
import { withRateLimit } from "@/app/lib/rate-limit/with-rate-limit";
import { getPaymentProvider } from "@/app/lib/payment";
import { syncQuotaOnSubscriptionEnd } from "@/app/lib/payment/sync-quota";

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return unauthorized();
      }

      const body = await request.json();
      const parsed = cancelSchema.safeParse(body);
      if (!parsed.success) {
        return validationError("VALIDATION_FAILED", parsed.error.flatten());
      }

      const subscription = await prisma.subscription.findUnique({
        where: { user_id: session.user.id },
      });

      if (
        !subscription ||
        !["ACTIVE", "SUSPENDED"].includes(subscription.status)
      ) {
        return apiError("PAYMENT_SUBSCRIPTION_NOT_FOUND");
      }

      // Cancel at provider (skip for legacy TOSS — no active provider integration)
      if (subscription.provider_subscription_id && subscription.provider) {
        const providerKey = subscription.provider.toLowerCase();
        if (providerKey === "toss") {
          // Legacy Toss subscriptions: cancel locally only (no API to call)
          console.warn(
            `Legacy TOSS subscription ${subscription.id} cancelled locally only`,
          );
        } else {
          try {
            const provider = getPaymentProvider(
              providerKey as "lemonsqueezy" | "stripe",
            );
            await provider.cancelSubscription(
              subscription.provider_subscription_id,
            );
          } catch (error) {
            console.error("Provider cancel error:", error);
            return apiError("PAYMENT_CANCEL_FAILED");
          }
        }
      }

      // Update local subscription
      const now = new Date();
      const periodExpired = subscription.current_period_end <= now;

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          // Period already elapsed → EXPIRED immediately, still active → CANCELLED (use until end)
          status: periodExpired ? "EXPIRED" : "CANCELLED",
          cancel_reason: parsed.data.reason,
          cancel_requested_at: now,
          cancelled_at: now,
          cancel_at: periodExpired ? now : subscription.current_period_end,
        },
      });

      // Period expired + cancelled → immediately downgrade quota
      if (periodExpired) {
        await syncQuotaOnSubscriptionEnd(session.user.id);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Subscription cancel error:", error);
      return apiError("PAYMENT_CANCEL_FAILED");
    }
  },
  { ipLimitPerMinute: 5 },
);
