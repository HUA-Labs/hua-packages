/**
 * Payment Provider Factory
 *
 * Selects the payment provider based on PAYMENT_PROVIDER env var.
 */

import type { PaymentProvider } from "./interface";
import { LemonSqueezyProvider } from "./lemonsqueezy";
import { StripeProvider } from "./stripe";
import { TossProvider } from "./toss";

type ProviderName = "lemonsqueezy" | "stripe" | "toss";

const providers: Record<ProviderName, () => PaymentProvider> = {
  lemonsqueezy: () => new LemonSqueezyProvider(),
  stripe: () => new StripeProvider(),
  toss: () => new TossProvider(),
};

let cachedProvider: PaymentProvider | null = null;
let cachedProviderName: ProviderName | null = null;

export function getPaymentProvider(name?: ProviderName): PaymentProvider {
  const providerName =
    name ?? (process.env.PAYMENT_PROVIDER as ProviderName) ?? "lemonsqueezy";

  if (cachedProvider && cachedProviderName === providerName) {
    return cachedProvider;
  }

  const factory = providers[providerName];
  if (!factory) {
    throw new Error(
      `Unknown payment provider: ${providerName}. Supported: ${Object.keys(providers).join(", ")}`,
    );
  }

  cachedProvider = factory();
  cachedProviderName = providerName;
  return cachedProvider;
}
