/**
 * Token Estimator
 *
 * Estimates token usage and cost for LLM operations.
 * Pure estimation logic — no database dependency.
 */

/**
 * Token estimation result
 */
export interface TokenEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

/**
 * Pricing configuration
 */
export interface TokenPricing {
  /** Cost per input token (USD) */
  inputCostPerToken: number;
  /** Cost per output token (USD) */
  outputCostPerToken: number;
}

/**
 * Output multipliers per operation type
 */
export interface OutputMultipliers {
  [operation: string]: number;
}

/**
 * Default GPT-4o-mini pricing (2024)
 */
export const DEFAULT_PRICING: TokenPricing = {
  inputCostPerToken: 0.15 / 1_000_000,   // $0.15 per 1M tokens
  outputCostPerToken: 0.60 / 1_000_000,  // $0.60 per 1M tokens
};

/**
 * Default output multipliers
 */
export const DEFAULT_OUTPUT_MULTIPLIERS: OutputMultipliers = {
  polish: 1.0,
  tags: 0.1,
  translate_en: 0.8,
  translate_ja: 1.2,
};

/**
 * Estimate tokens for a single operation
 *
 * @param inputLength Input text length (characters)
 * @param operation Operation type (affects output estimation)
 * @param multipliers Custom output multipliers (optional)
 * @returns Estimated input and output tokens
 */
export function estimateOperationTokens(
  inputLength: number,
  operation: string,
  multipliers?: OutputMultipliers
): { input: number; output: number } {
  const effectiveMultipliers = multipliers ?? DEFAULT_OUTPUT_MULTIPLIERS;
  const inputTokens = Math.ceil(inputLength * 1.5);
  const outputTokens = Math.ceil(inputTokens * (effectiveMultipliers[operation] ?? 1.0));

  return { input: inputTokens, output: outputTokens };
}

/**
 * Estimate total tokens and cost for multiple operations
 *
 * @example
 * ```typescript
 * const estimate = estimateTokens(5000, ['polish', 'translate_en']);
 * console.log(`Cost: $${estimate.estimatedCost.toFixed(4)}`);
 * ```
 */
export function estimateTokens(
  inputLength: number,
  operations: string[],
  options?: {
    pricing?: TokenPricing;
    multipliers?: OutputMultipliers;
  }
): TokenEstimate {
  const pricing = options?.pricing ?? DEFAULT_PRICING;
  const multipliers = options?.multipliers ?? DEFAULT_OUTPUT_MULTIPLIERS;

  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (const operation of operations) {
    const effectiveInputLength = operation === 'tags'
      ? Math.min(inputLength, 1000)
      : inputLength;

    const { input, output } = estimateOperationTokens(effectiveInputLength, operation, multipliers);
    totalInputTokens += input;
    totalOutputTokens += output;
  }

  const totalTokens = totalInputTokens + totalOutputTokens;
  const estimatedCost = (totalInputTokens * pricing.inputCostPerToken) +
                        (totalOutputTokens * pricing.outputCostPerToken);

  return {
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    totalTokens,
    estimatedCost,
  };
}
