/**
 * LemonSqueezy Payment Provider
 *
 * MoR (Merchant of Record) model — handles tax/VAT automatically.
 * Uses LemonSqueezy API v1 for checkout sessions and subscription management.
 */

import { createHmac } from "crypto";
import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  WebhookEvent,
  WebhookSubscriptionData,
} from "./interface";

const LEMONSQUEEZY_API_BASE = "https://api.lemonsqueezy.com/v1";

function getApiKey(): string {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error("LEMONSQUEEZY_API_KEY is not configured");
  return key;
}

function getStoreId(): string {
  const id = process.env.LEMONSQUEEZY_STORE_ID;
  if (!id) throw new Error("LEMONSQUEEZY_STORE_ID is not configured");
  return id;
}

function getWebhookSecret(): string {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured");
  return secret;
}

async function lemonFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${LEMONSQUEEZY_API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${getApiKey()}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LemonSqueezy API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export class LemonSqueezyProvider implements PaymentProvider {
  readonly provider = "LEMONSQUEEZY" as const;

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
    const storeId = getStoreId();

    // LemonSqueezy checkout requires a provider-side variant ID, not our DB plan UUID.
    // The variant ID is stored in Plan.features JSON under the appropriate billing cycle key.
    const variantId = params.providerVariantId;
    if (!variantId) {
      throw new Error("LemonSqueezy variant ID is required for checkout");
    }

    const result = await lemonFetch<{
      data: { id: string; attributes: { url: string } };
    }>("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: params.customerEmail,
              name: params.customerName,
              custom: {
                user_id: params.userId,
                plan_id: params.planId,
                billing_cycle: params.billingCycle,
              },
            },
            product_options: {
              redirect_url: params.successUrl,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: storeId } },
            variant: { data: { type: "variants", id: variantId } },
          },
        },
      }),
    });

    return {
      checkoutUrl: result.data.attributes.url,
      sessionId: result.data.id,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await lemonFetch(`/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = getWebhookSecret();
    const hmac = createHmac("sha256", secret);
    const digest = hmac.update(payload).digest("hex");
    return digest === signature;
  }

  async handleWebhook(_event: WebhookEvent): Promise<void> {
    // Webhook handling is done in the route handler
    // which parses the event and calls the appropriate service functions.
    // This method is reserved for provider-specific webhook processing.
  }

  async getSubscription(
    providerSubscriptionId: string,
  ): Promise<WebhookSubscriptionData | null> {
    try {
      const result = await lemonFetch<{
        data: {
          id: string;
          attributes: {
            status: string;
            renews_at: string | null;
            ends_at: string | null;
            created_at: string;
            updated_at: string;
            user_email: string;
            user_name: string;
            variant_id: number;
            customer_id: number;
            order_id: number;
          };
        };
      }>(`/subscriptions/${providerSubscriptionId}`);

      const attrs = result.data.attributes;
      const statusMap: Record<string, WebhookSubscriptionData["status"]> = {
        active: "active",
        past_due: "suspended",
        unpaid: "suspended",
        cancelled: "cancelled",
        expired: "expired",
        paused: "suspended",
      };

      const now = new Date();
      const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : null;

      return {
        providerSubscriptionId: result.data.id,
        providerCustomerId: String(attrs.customer_id),
        planId: String(attrs.variant_id),
        status: statusMap[attrs.status] ?? "active",
        currentPeriodStart: now,
        currentPeriodEnd:
          renewsAt ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        amount: 0,
        currency: "USD",
        customerEmail: attrs.user_email,
        customerName: attrs.user_name,
      };
    } catch {
      return null;
    }
  }
}
