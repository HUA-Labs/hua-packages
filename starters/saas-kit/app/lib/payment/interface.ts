/**
 * Payment Provider Interface
 *
 * Provider-agnostic payment system.
 * All payment providers (LemonSqueezy, Stripe, Toss) implement this interface.
 */

import type { PaymentProvider as PrismaPaymentProvider } from "@/prisma/generated/client";

// ── Checkout ──

export interface CheckoutParams {
  userId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
  /** Provider-side variant/price ID (e.g. LemonSqueezy variant ID, Stripe price ID) */
  providerVariantId?: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

// ── Webhook ──

export interface WebhookEvent {
  type: string;
  provider: PrismaPaymentProvider;
  data: Record<string, unknown>;
}

export interface WebhookSubscriptionData {
  providerSubscriptionId: string;
  providerCustomerId: string;
  planId: string;
  status: "active" | "cancelled" | "expired" | "suspended";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  billingCycle: "monthly" | "yearly";
  amount: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
}

export interface WebhookPaymentData {
  providerPaymentId: string;
  providerOrderId?: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "refunded";
  method?: string;
  methodType?: string;
  paidAt?: Date;
}

// ── Provider Interface ──

export interface PaymentProvider {
  readonly provider: PrismaPaymentProvider;

  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;

  cancelSubscription(subscriptionId: string): Promise<void>;

  verifyWebhookSignature(payload: string, signature: string): boolean;

  handleWebhook(event: WebhookEvent): Promise<void>;

  getSubscription(
    providerSubscriptionId: string,
  ): Promise<WebhookSubscriptionData | null>;
}
