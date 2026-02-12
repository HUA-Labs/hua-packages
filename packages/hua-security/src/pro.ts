/**
 * @hua-labs/security/pro
 *
 * Pro tier: KMS, CAPTCHA, abuse detection, token estimation.
 *
 * @example
 * ```typescript
 * import { shouldSkipAnalysis, estimateTokens } from '@hua-labs/security/pro';
 * ```
 */

// KMS
export {
  isKMSEnabled,
  envelopeEncrypt,
  envelopeDecrypt,
  isEnvelopeFormat,
  resetKMSClient,
} from './pro/kms/kms-client';

// Abuse Pattern Engine
export {
  shouldSkipAnalysis,
  matchAbusePatterns,
  ABUSE_DETECTION_CONFIG,
} from './pro/abuse/pattern-engine';
export type {
  AbusePattern,
  PenaltyLevel,
  PatternMatchResult,
} from './pro/abuse/pattern-engine';

// Token Estimator
export {
  estimateOperationTokens,
  estimateTokens,
  DEFAULT_PRICING,
  DEFAULT_OUTPUT_MULTIPLIERS,
} from './pro/token/estimator';
export type {
  TokenEstimate,
  TokenPricing,
  OutputMultipliers,
} from './pro/token/estimator';
