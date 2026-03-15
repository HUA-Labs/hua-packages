/**
 * POST /api/payments/checkout
 *
 * Creates a checkout session for the selected plan.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { apiError, unauthorized, validationError } from "@/app/lib/errors";
import { withRateLimit } from "@/app/lib/rate-limit/with-rate-limit";
import { getPaymentProvider } from "@/app/lib/payment";

const safeUrl = z
  .string()
  .url()
  .refine((url) => /^https?:\/\//i.test(url), {
    message: "Only http/https URLs are allowed",
  });

const checkoutSchema = z.object({
  planId: z.string().uuid(),
  billingCycle: z.enum(["monthly", "yearly"]),
  successUrl: safeUrl,
  cancelUrl: safeUrl,
});

export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return unauthorized();
      }

      const body = await request.json();
      const parsed = checkoutSchema.safeParse(body);
      if (!parsed.success) {
        return validationError("VALIDATION_FAILED", parsed.error.flatten());
      }

      const { planId, billingCycle, successUrl, cancelUrl } = parsed.data;

      // Check plan exists
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan || !plan.is_active) {
        return apiError("PAYMENT_PLAN_NOT_FOUND");
      }

      // Resolve provider-side variant ID from Plan.features JSON
      // Expected format: { "lemonsqueezy_variant_monthly": "123", "lemonsqueezy_variant_yearly": "456", ... }
      // Toss doesn't use variants — skip the variant lookup for TOSS provider.
      const features = (plan.features ?? {}) as Record<string, string>;
      const provider = getPaymentProvider();
      const isToss = provider.provider === "TOSS";
      const variantKey = `${provider.provider.toLowerCase()}_variant_${billingCycle}`;
      const providerVariantId = features[variantKey];
      if (!isToss && !providerVariantId) {
        return apiError("PAYMENT_PLAN_NOT_FOUND");
      }

      // Block checkout if user has a non-terminal subscription
      const existing = await prisma.subscription.findUnique({
        where: { user_id: session.user.id },
      });
      if (existing) {
        const now = new Date();
        const isTerminal =
          existing.status === "EXPIRED" ||
          (existing.status === "CANCELLED" &&
            existing.current_period_end &&
            existing.current_period_end <= now);
        if (!isTerminal) {
          return apiError("PAYMENT_ALREADY_SUBSCRIBED");
        }
      }

      const result = await provider.createCheckoutSession({
        userId: session.user.id,
        planId,
        billingCycle,
        customerEmail: session.user.email ?? "",
        customerName: session.user.name ?? undefined,
        successUrl,
        cancelUrl,
        providerVariantId,
      });

      return NextResponse.json(result);
    } catch (error) {
      console.error("Checkout error:", error);
      return apiError("PAYMENT_CHECKOUT_FAILED");
    }
  },
  { ipLimitPerMinute: 10 },
);
