/**
 * TossPayments Payment Provider
 *
 * Korea payments only. Billing-key based recurring payments (auto billing).
 * Flow: SDK card registration → authKey → issue billing key → execute server-side payment
 *
 * API Docs: https://docs.tosspayments.com/reference
 */

import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  WebhookEvent,
  WebhookSubscriptionData,
} from "./interface";

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

function getSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) throw new Error("TOSS_SECRET_KEY is not configured");
  return key;
}

function getAuthHeader(): string {
  return "Basic " + Buffer.from(getSecretKey() + ":").toString("base64");
}

async function tossFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${TOSS_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TossPayments API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ── Billing Key API ──

export interface TossBillingKeyResponse {
  billingKey: string;
  customerKey: string;
  cardCompany: string;
  cardNumber: string;
  authenticatedAt: string;
  method: string;
}

/** authKey + customerKey → issue billing key */
export async function issueBillingKey(
  authKey: string,
  customerKey: string,
): Promise<TossBillingKeyResponse> {
  return tossFetch<TossBillingKeyResponse>("/billing/authorizations/issue", {
    method: "POST",
    body: JSON.stringify({ authKey, customerKey }),
  });
}

// ── Billing Execution API ──

export interface TossBillingParams {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
  customerEmail?: string;
  customerName?: string;
}

export interface TossBillingResponse {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
    cardType: string;
  };
}

/** Execute auto billing with billing key */
export async function executeBilling(
  params: TossBillingParams,
): Promise<TossBillingResponse> {
  const { billingKey, ...body } = params;
  return tossFetch<TossBillingResponse>(`/billing/${billingKey}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Payment Cancellation API ──

export interface TossCancelParams {
  paymentKey: string;
  cancelReason: string;
}

export async function cancelPayment(params: TossCancelParams): Promise<void> {
  await tossFetch(`/payments/${params.paymentKey}/cancel`, {
    method: "POST",
    body: JSON.stringify({ cancelReason: params.cancelReason }),
  });
}

// ── Provider Implementation ──

export class TossProvider implements PaymentProvider {
  readonly provider = "TOSS" as const;

  /**
   * Toss uses client SDK, not hosted checkout.
   * This method returns the success/cancel URLs and customerKey for SDK redirect.
   * Client must call requestBillingAuth() from @tosspayments/tosspayments-sdk.
   */
  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
    const clientKey = process.env.TOSS_CLIENT_KEY;
    if (!clientKey) throw new Error("TOSS_CLIENT_KEY is not configured");

    // Toss has no hosted checkout URL — redirect to our billing registration page
    // Pass caller's successUrl/cancelUrl as query params for post-flow redirect
    const customerKey = params.userId;
    const url = new URL("/billing/register", "http://placeholder");
    url.searchParams.set("planId", params.planId);
    url.searchParams.set("billingCycle", params.billingCycle);
    url.searchParams.set("customerKey", customerKey);
    url.searchParams.set("successUrl", params.successUrl);
    url.searchParams.set("cancelUrl", params.cancelUrl);
    const checkoutUrl = url.pathname + url.search;

    return {
      checkoutUrl,
      sessionId: customerKey,
    };
  }

  /**
   * Toss recurring payments are managed server-side — no provider API cancellation.
   * Simply skip the next billing execution. Only update subscription status in DB.
   */
  async cancelSubscription(_subscriptionId: string): Promise<void> {
    // Toss billing is executed periodically by the server,
    // so "cancel subscription" means not executing the next payment.
    // DB state update is handled in the API route.
  }

  /**
   * Toss webhooks are used for virtual account deposit notifications, etc.
   * Billing results are received directly via API response — webhook signature verification not used.
   */
  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // Toss billing is server-initiated — no webhook signature verification needed
    return true;
  }

  async handleWebhook(_event: WebhookEvent): Promise<void> {
    // Toss billing is server-initiated — no webhook handling needed
  }

  async getSubscription(
    _providerSubscriptionId: string,
  ): Promise<WebhookSubscriptionData | null> {
    // Toss has no subscription query API — our DB is the source of truth
    return null;
  }
}
