/**
 * Stripe Payment Provider (Stub)
 *
 * To be implemented after US entity setup.
 * All methods throw "not implemented" errors for now.
 */

import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  WebhookEvent,
  WebhookSubscriptionData,
} from "./interface";

export class StripeProvider implements PaymentProvider {
  readonly provider = "STRIPE" as const;

  async createCheckoutSession(
    _params: CheckoutParams,
  ): Promise<CheckoutResult> {
    throw new Error("Stripe provider is not yet implemented");
  }

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    throw new Error("Stripe provider is not yet implemented");
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    throw new Error("Stripe provider is not yet implemented");
  }

  async handleWebhook(_event: WebhookEvent): Promise<void> {
    throw new Error("Stripe provider is not yet implemented");
  }

  async getSubscription(
    _providerSubscriptionId: string,
  ): Promise<WebhookSubscriptionData | null> {
    throw new Error("Stripe provider is not yet implemented");
  }
}
