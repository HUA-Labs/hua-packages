/**
 * Rate Limit Presets
 *
 * Common rate limit configurations for different endpoint types.
 * Ported from my-app's RATE_LIMIT_PRESETS pattern.
 */

export interface RateLimitPreset {
  ipLimitPerMinute: number;
  userLimitPerMinute?: number;
}

export const RATE_LIMIT_PRESETS = {
  /** General API endpoints */
  default: { ipLimitPerMinute: 60 },
  /** Authentication endpoints (login, register, reset) */
  auth: { ipLimitPerMinute: 20 },
  /** Diary CRUD operations */
  diary: { ipLimitPerMinute: 30 },
  /** Search endpoints */
  search: { ipLimitPerMinute: 30 },
  /** AI analysis endpoints */
  analyze: { ipLimitPerMinute: 10 },
  /** Sensitive operations (password change, account delete) */
  sensitive: { ipLimitPerMinute: 5 },
} as const satisfies Record<string, RateLimitPreset>;

export type RateLimitPresetName = keyof typeof RATE_LIMIT_PRESETS;
