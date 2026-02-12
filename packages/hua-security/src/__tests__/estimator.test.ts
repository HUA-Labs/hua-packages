import { describe, it, expect } from 'vitest';
import {
  estimateTokens,
  estimateOperationTokens,
  DEFAULT_PRICING,
  DEFAULT_OUTPUT_MULTIPLIERS,
} from '../pro/token/estimator';

describe('token estimator', () => {
  describe('estimateOperationTokens', () => {
    it('should estimate input tokens from length', () => {
      const result = estimateOperationTokens(1000, 'polish');
      expect(result.input).toBe(1500); // 1000 * 1.5
      expect(result.output).toBe(1500); // polish = 1.0x
    });

    it('should apply output multiplier for tags', () => {
      const result = estimateOperationTokens(1000, 'tags');
      expect(result.output).toBe(150); // 1500 * 0.1
    });

    it('should apply output multiplier for translate_en', () => {
      const result = estimateOperationTokens(1000, 'translate_en');
      expect(result.output).toBe(1200); // 1500 * 0.8
    });

    it('should apply output multiplier for translate_ja', () => {
      const result = estimateOperationTokens(1000, 'translate_ja');
      expect(result.output).toBe(1800); // 1500 * 1.2
    });

    it('should default to 1.0x for unknown operation', () => {
      const result = estimateOperationTokens(1000, 'unknown');
      expect(result.output).toBe(1500);
    });

    // Custom multipliers:
    it('should accept custom multipliers', () => {
      const custom = { summarize: 0.5 };
      const result = estimateOperationTokens(1000, 'summarize', custom);
      expect(result.output).toBe(750); // 1500 * 0.5
    });
  });

  describe('estimateTokens', () => {
    it('should estimate for single operation', () => {
      const result = estimateTokens(1000, ['polish']);
      expect(result.inputTokens).toBe(1500);
      expect(result.outputTokens).toBe(1500);
      expect(result.totalTokens).toBe(3000);
      expect(result.estimatedCost).toBeGreaterThan(0);
    });

    it('should sum multiple operations', () => {
      const result = estimateTokens(1000, ['polish', 'translate_en']);
      expect(result.inputTokens).toBe(3000); // 1500 + 1500
      expect(result.outputTokens).toBe(2700); // 1500 + 1200
    });

    it('should cap tags input to 1000', () => {
      const result = estimateTokens(5000, ['tags']);
      expect(result.inputTokens).toBe(1500); // min(5000, 1000) * 1.5
    });

    it('should calculate cost with default pricing', () => {
      const result = estimateTokens(1000, ['polish']);
      const expectedCost = (1500 * DEFAULT_PRICING.inputCostPerToken) +
                          (1500 * DEFAULT_PRICING.outputCostPerToken);
      expect(result.estimatedCost).toBeCloseTo(expectedCost);
    });

    it('should accept custom pricing', () => {
      const result = estimateTokens(1000, ['polish'], {
        pricing: { inputCostPerToken: 0.001, outputCostPerToken: 0.002 },
      });
      expect(result.estimatedCost).toBe(1500 * 0.001 + 1500 * 0.002);
    });

    // Empty operations:
    it('should return zero for empty operations', () => {
      const result = estimateTokens(1000, []);
      expect(result.totalTokens).toBe(0);
      expect(result.estimatedCost).toBe(0);
    });

    // Zero input:
    it('should handle zero input length', () => {
      const result = estimateTokens(0, ['polish']);
      expect(result.inputTokens).toBe(0);
      expect(result.outputTokens).toBe(0);
    });

    // Large input:
    it('should handle very large input', () => {
      const result = estimateTokens(1000000, ['polish']);
      expect(result.inputTokens).toBe(1500000);
      expect(result.totalTokens).toBe(3000000);
    });

    // Multiple same operations:
    it('should accumulate same operation multiple times', () => {
      const result = estimateTokens(1000, ['polish', 'polish', 'polish']);
      expect(result.inputTokens).toBe(4500); // 1500 * 3
      expect(result.outputTokens).toBe(4500); // 1500 * 3
    });

    // Custom multipliers in estimateTokens:
    it('should use custom multipliers in estimateTokens', () => {
      const result = estimateTokens(1000, ['custom_op'], {
        multipliers: { custom_op: 2.0 },
      });
      expect(result.outputTokens).toBe(3000); // 1500 * 2.0
    });
  });

  // Export validation:
  describe('exports', () => {
    it('should export DEFAULT_PRICING with correct structure', () => {
      expect(DEFAULT_PRICING.inputCostPerToken).toBeGreaterThan(0);
      expect(DEFAULT_PRICING.outputCostPerToken).toBeGreaterThan(0);
      expect(DEFAULT_PRICING.outputCostPerToken).toBeGreaterThan(DEFAULT_PRICING.inputCostPerToken);
    });

    it('should export DEFAULT_OUTPUT_MULTIPLIERS', () => {
      expect(DEFAULT_OUTPUT_MULTIPLIERS.polish).toBe(1.0);
      expect(DEFAULT_OUTPUT_MULTIPLIERS.tags).toBe(0.1);
      expect(DEFAULT_OUTPUT_MULTIPLIERS.translate_en).toBe(0.8);
      expect(DEFAULT_OUTPUT_MULTIPLIERS.translate_ja).toBe(1.2);
    });
  });
});
