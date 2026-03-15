import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import { apiError } from "@/app/lib/errors";
import { logger } from "@/app/lib/infra/logger";
import { executeBilling } from "@/app/lib/payment/toss";
import {
  syncQuotaOnSubscriptionEnd,
  processExpiredTrials,
} from "@/app/lib/payment/sync-quota";

/**
 * Vercel Cron Job: Toss recurring billing + expiry processing
 *
 * Runs daily at KST 09:00 (UTC 00:00)
 *
 * 1. Toss subscriptions past current_period_end → attempt rebilling
 * 2. 3 consecutive failures → EXPIRED + quota downgrade
 * 3. Trial expiry processing
 */

const MAX_RETRY = 3;

/**
 * Calendar-safe period addition.
 * Anchors on the original date to prevent drift.
 * Handles month-end edge cases (e.g., Jan 31 + 1 month = Feb 28).
 */
function addPeriod(anchor: Date, cycle: string): Date {
  const d = new Date(anchor);
  const origDay = d.getDate();

  if (cycle === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }

  // month-end clamp: if original day was 31 but new month has 28/29/30 days
  if (d.getDate() !== origDay) {
    d.setDate(0); // last day of previous month
  }

  return d;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return apiError("INTERNAL_ERROR");
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return apiError("AUTH_REQUIRED");
  }

  const results = {
    rebilled: 0,
    failed: 0,
    expired: 0,
    trialsExpired: 0,
  };

  try {
    // ── 1. Toss subscription rebilling ──
    const now = new Date();

    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        provider: "TOSS",
        status: { in: ["ACTIVE", "SUSPENDED"] },
        current_period_end: { lte: now },
      },
      include: { plan: true },
    });

    for (const sub of dueSubscriptions) {
      const billingKey = sub.provider_subscription_id;
      const customerKey = sub.provider_customer_id;

      if (!billingKey || !customerKey) {
        logger.error("Toss billing cron: missing billingKey/customerKey", {
          subId: sub.id,
        });
        continue;
      }

      // Check consecutive failure count
      const recentFailures = await prisma.payment.count({
        where: {
          subscription_id: sub.id,
          provider: "TOSS",
          status: "FAILED",
          created_at: { gte: sub.current_period_end },
        },
      });

      if (recentFailures >= MAX_RETRY) {
        // 3+ failures → expire
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "EXPIRED" },
        });
        await syncQuotaOnSubscriptionEnd(sub.user_id);
        results.expired++;
        logger.info("Toss billing expired after max retries", {
          subId: sub.id,
          userId: sub.user_id,
        });
        continue;
      }

      // Attempt rebilling
      const amount = Number(sub.amount);
      const orderId = `rebill_${sub.id}_${Date.now()}`;
      const orderName = `${sub.plan.display_name} (${sub.billing_cycle === "yearly" ? "Annual" : "Monthly"})`;

      try {
        const payment = await executeBilling({
          billingKey,
          customerKey,
          amount,
          orderId,
          orderName,
        });

        // Payment success → advance period (anchored on previous period_end to prevent drift)
        const anchor = sub.current_period_end;
        const newPeriodStart = new Date(anchor);
        const newPeriodEnd = addPeriod(anchor, sub.billing_cycle);

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: "ACTIVE",
            current_period_start: newPeriodStart,
            current_period_end: newPeriodEnd,
          },
        });

        // Record payment
        await prisma.payment.create({
          data: {
            user_id: sub.user_id,
            subscription_id: sub.id,
            provider: "TOSS",
            provider_payment_id: payment.paymentKey,
            provider_order_id: payment.orderId,
            amount,
            currency: "KRW",
            status: "SUCCESS",
            method: payment.method,
            method_type: payment.card?.cardType ?? "CARD",
            order_name: orderName,
            paid_at: new Date(payment.approvedAt),
          },
        });

        results.rebilled++;
        logger.info("Toss billing success", {
          subId: sub.id,
          paymentKey: payment.paymentKey,
        });
      } catch (err) {
        // Payment failure → SUSPENDED + record failure
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "SUSPENDED" },
        });

        await prisma.payment.create({
          data: {
            user_id: sub.user_id,
            subscription_id: sub.id,
            provider: "TOSS",
            provider_payment_id: `failed_${orderId}`,
            provider_order_id: orderId,
            amount,
            currency: "KRW",
            status: "FAILED",
            method: "card",
            order_name: orderName,
          },
        });

        results.failed++;
        logger.error("Toss billing failed", {
          subId: sub.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // ── 2. Trial expiry processing ──
    results.trialsExpired = await processExpiredTrials();

    logger.info("Billing cron complete", results);

    return NextResponse.json({
      ok: true,
      ...results,
      processedAt: now.toISOString(),
    });
  } catch (error) {
    logger.error("Billing cron error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError("INTERNAL_ERROR");
  }
}
