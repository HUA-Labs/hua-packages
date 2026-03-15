/**
 * POST /api/webhooks/lemonsqueezy
 *
 * Handles LemonSqueezy webhook events.
 * Verifies HMAC SHA256 signature before processing.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import { apiError } from "@/app/lib/errors";
import { logger } from "@/app/lib/infra/logger";
import { LemonSqueezyProvider } from "@/app/lib/payment";
import {
  syncQuotaOnSubscriptionActive,
  syncQuotaOnSubscriptionEnd,
} from "@/app/lib/payment/sync-quota";

const provider = new LemonSqueezyProvider();

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-signature");
    if (!signature) {
      return apiError("PAYMENT_WEBHOOK_INVALID_SIGNATURE");
    }

    const rawBody = await request.text();

    if (!provider.verifyWebhookSignature(rawBody, signature)) {
      return apiError("PAYMENT_WEBHOOK_INVALID_SIGNATURE");
    }

    const event = JSON.parse(rawBody);
    const eventName: string = event.meta?.event_name ?? "";
    const customData = event.meta?.custom_data ?? {};
    const attrs = event.data?.attributes ?? {};

    switch (eventName) {
      case "subscription_created": {
        const userId = customData.user_id;
        const planId = customData.plan_id;
        const billingCycle = customData.billing_cycle ?? "monthly";

        if (!userId || !planId) break;

        const now = new Date();
        const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : null;
        const periodEnd =
          renewsAt ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // LemonSqueezy sends status: "on_trial" with trial_ends_at for trial subscriptions
        const isTrial = attrs.status === "on_trial";
        const trialEnd = attrs.trial_ends_at
          ? new Date(attrs.trial_ends_at)
          : null;

        // Resolve amount from our Plan table
        const plan = await prisma.plan.findUnique({
          where: { id: planId },
          select: { price_monthly: true, price_yearly: true },
        });
        const amount = plan
          ? Number(
              billingCycle === "yearly"
                ? (plan.price_yearly ?? plan.price_monthly)
                : plan.price_monthly,
            )
          : 0;

        const sub = await prisma.subscription.upsert({
          where: { user_id: userId },
          create: {
            user_id: userId,
            plan_id: planId,
            provider: "LEMONSQUEEZY",
            provider_subscription_id: String(event.data.id),
            provider_customer_id: String(attrs.customer_id),
            status: "ACTIVE",
            billing_cycle: billingCycle,
            amount,
            started_at: now,
            current_period_start: now,
            current_period_end: periodEnd,
            is_trial: isTrial,
            trial_end: trialEnd,
          },
          update: {
            plan_id: planId,
            provider: "LEMONSQUEEZY",
            provider_subscription_id: String(event.data.id),
            provider_customer_id: String(attrs.customer_id),
            status: "ACTIVE",
            billing_cycle: billingCycle,
            amount,
            current_period_start: now,
            current_period_end: periodEnd,
            is_trial: isTrial,
            trial_end: trialEnd,
          },
        });

        await syncQuotaOnSubscriptionActive(userId, sub.id, planId);
        break;
      }

      case "subscription_updated": {
        const subId = String(event.data.id);
        const sub = await prisma.subscription.findFirst({
          where: { provider_subscription_id: subId, provider: "LEMONSQUEEZY" },
        });
        if (!sub) break;

        const statusMap: Record<
          string,
          "ACTIVE" | "CANCELLED" | "EXPIRED" | "SUSPENDED"
        > = {
          active: "ACTIVE",
          on_trial: "ACTIVE", // trial is tracked locally as ACTIVE + is_trial
          past_due: "SUSPENDED",
          unpaid: "SUSPENDED",
          cancelled: "CANCELLED",
          expired: "EXPIRED",
          paused: "SUSPENDED",
        };

        const newStatus = statusMap[attrs.status] ?? "ACTIVE";
        const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : null;

        const clearTrial = sub.is_trial && attrs.status === "active";
        const resumed = sub.status === "CANCELLED" && newStatus === "ACTIVE";

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: newStatus,
            ...(renewsAt && { current_period_end: renewsAt }),
            ...(attrs.ends_at
              ? { cancel_at: new Date(attrs.ends_at) }
              : resumed
                ? { cancel_at: null, cancelled_at: null }
                : {}),
            ...(clearTrial && { is_trial: false, trial_end: null }),
          },
        });
        break;
      }

      case "subscription_cancelled": {
        // User requested cancellation — subscription remains active until ends_at.
        // Do NOT downgrade quota here; the user has paid until the period ends.
        // Quota downgrade happens on subscription_expired.
        const subId = String(event.data.id);
        const sub = await prisma.subscription.findFirst({
          where: { provider_subscription_id: subId, provider: "LEMONSQUEEZY" },
        });
        if (!sub) break;

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: "CANCELLED",
            cancelled_at: new Date(),
            cancel_at: attrs.ends_at ? new Date(attrs.ends_at) : null,
          },
        });
        break;
      }

      case "subscription_expired": {
        // Subscription has actually ended (period elapsed after cancellation or non-renewal).
        // Now downgrade quota to free limits.
        const subId = String(event.data.id);
        const sub = await prisma.subscription.findFirst({
          where: { provider_subscription_id: subId, provider: "LEMONSQUEEZY" },
        });
        if (!sub) break;

        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "EXPIRED" },
        });

        await syncQuotaOnSubscriptionEnd(sub.user_id);
        break;
      }

      case "subscription_payment_success": {
        const subId = String(attrs.subscription_id);
        const sub = await prisma.subscription.findFirst({
          where: { provider_subscription_id: subId, provider: "LEMONSQUEEZY" },
        });
        if (!sub) break;

        // upsert: idempotent on webhook retries (same payment_id → no-op)
        await prisma.payment.upsert({
          where: {
            provider_provider_payment_id: {
              provider: "LEMONSQUEEZY",
              provider_payment_id: String(event.data.id),
            },
          },
          create: {
            user_id: sub.user_id,
            subscription_id: sub.id,
            provider: "LEMONSQUEEZY",
            provider_payment_id: String(event.data.id),
            amount: (attrs.subtotal ?? 0) / 100,
            currency: attrs.currency ?? "USD",
            status: "SUCCESS",
            method: "card",
            paid_at: new Date(),
          },
          update: {},
        });
        break;
      }

      case "subscription_payment_failed": {
        const subId = String(attrs.subscription_id);
        const sub = await prisma.subscription.findFirst({
          where: { provider_subscription_id: subId, provider: "LEMONSQUEEZY" },
        });
        if (!sub) break;

        await prisma.payment.upsert({
          where: {
            provider_provider_payment_id: {
              provider: "LEMONSQUEEZY",
              provider_payment_id: String(event.data.id),
            },
          },
          create: {
            user_id: sub.user_id,
            subscription_id: sub.id,
            provider: "LEMONSQUEEZY",
            provider_payment_id: String(event.data.id),
            amount: (attrs.subtotal ?? 0) / 100,
            currency: attrs.currency ?? "USD",
            status: "FAILED",
            method: "card",
          },
          update: {},
        });

        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "SUSPENDED" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("LemonSqueezy webhook error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError("PAYMENT_WEBHOOK_PROCESSING_FAILED");
  }
}
