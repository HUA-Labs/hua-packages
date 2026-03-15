/**
 * POST /api/payments/toss/billing-key
 *
 * TossPayments billing key issuance.
 * Client sends authKey + customerKey after completing SDK requestBillingAuth().
 * Issues billing key, saves PaymentMethod, creates subscription, and executes first payment.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { apiError, unauthorized, validationError } from "@/app/lib/errors";
import { withRateLimit } from "@/app/lib/rate-limit/with-rate-limit";
import { issueBillingKey, executeBilling } from "@/app/lib/payment/toss";
import { syncQuotaOnSubscriptionActive } from "@/app/lib/payment/sync-quota";
import { logger } from "@/app/lib/infra/logger";

const billingKeySchema = z.object({
  authKey: z.string().min(1),
  customerKey: z.string().min(1),
  planId: z.string().uuid(),
  billingCycle: z.enum(["monthly", "yearly"]),
});

export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return unauthorized();
      }

      const body = await request.json();
      const parsed = billingKeySchema.safeParse(body);
      if (!parsed.success) {
        return validationError("VALIDATION_FAILED", parsed.error.flatten());
      }

      const { authKey, customerKey, planId, billingCycle } = parsed.data;

      // Verify plan
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan || !plan.is_active) {
        return apiError("PAYMENT_PLAN_NOT_FOUND");
      }

      // Check for existing active subscription
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

      // 1. Issue billing key
      const billing = await issueBillingKey(authKey, customerKey);

      // 2. Save PaymentMethod
      await prisma.paymentMethod.upsert({
        where: {
          provider_provider_billing_key: {
            provider: "TOSS",
            provider_billing_key: billing.billingKey,
          },
        },
        create: {
          user_id: session.user.id,
          provider: "TOSS",
          provider_billing_key: billing.billingKey,
          provider_customer_id: billing.customerKey,
          method: billing.method ?? "card",
          method_type: "CARD",
          card_company: billing.cardCompany,
          card_number: billing.cardNumber,
          is_default: true,
        },
        update: {
          card_company: billing.cardCompany,
          card_number: billing.cardNumber,
        },
      });

      // 3. Execute first payment
      const amount = Number(
        billingCycle === "yearly"
          ? (plan.price_yearly ?? plan.price_monthly)
          : plan.price_monthly,
      );
      const orderId = `sub_${session.user.id}_${Date.now()}`;

      const payment = await executeBilling({
        billingKey: billing.billingKey,
        customerKey: billing.customerKey,
        amount,
        orderId,
        orderName: `${plan.display_name} (${billingCycle === "yearly" ? "Annual" : "Monthly"})`,
        customerEmail: session.user.email ?? undefined,
        customerName: session.user.name ?? undefined,
      });

      // 4. Create subscription (calendar-safe period)
      const now = new Date();
      const periodEnd = new Date(now);
      const origDay = periodEnd.getDate();
      if (billingCycle === "yearly") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      // month-end clamp (e.g., Jan 31 + 1mo = Feb 28, not Mar 3)
      if (periodEnd.getDate() !== origDay) {
        periodEnd.setDate(0);
      }

      const sub = await prisma.subscription.upsert({
        where: { user_id: session.user.id },
        create: {
          user_id: session.user.id,
          plan_id: planId,
          provider: "TOSS",
          provider_subscription_id: billing.billingKey,
          provider_customer_id: billing.customerKey,
          status: "ACTIVE",
          billing_cycle: billingCycle,
          amount,
          started_at: now,
          current_period_start: now,
          current_period_end: periodEnd,
        },
        update: {
          plan_id: planId,
          provider: "TOSS",
          provider_subscription_id: billing.billingKey,
          provider_customer_id: billing.customerKey,
          status: "ACTIVE",
          billing_cycle: billingCycle,
          amount,
          current_period_start: now,
          current_period_end: periodEnd,
        },
      });

      // 5. Record payment
      await prisma.payment.create({
        data: {
          user_id: session.user.id,
          subscription_id: sub.id,
          provider: "TOSS",
          provider_payment_id: payment.paymentKey,
          provider_order_id: payment.orderId,
          amount,
          currency: "KRW",
          status: "SUCCESS",
          method: payment.method,
          method_type: payment.card?.cardType ?? "CARD",
          order_name: payment.orderName,
          customer_email: session.user.email ?? undefined,
          customer_name: session.user.name,
          paid_at: new Date(payment.approvedAt),
        },
      });

      // 6. Sync quota
      await syncQuotaOnSubscriptionActive(session.user.id, sub.id, planId);

      return NextResponse.json({
        subscriptionId: sub.id,
        billingKey: billing.billingKey,
        paymentKey: payment.paymentKey,
        cardCompany: billing.cardCompany,
        cardNumber: billing.cardNumber,
      });
    } catch (error) {
      logger.error("Toss billing key error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return apiError("PAYMENT_CHECKOUT_FAILED");
    }
  },
  { ipLimitPerMinute: process.env.NODE_ENV === "development" ? 60 : 5 },
);
