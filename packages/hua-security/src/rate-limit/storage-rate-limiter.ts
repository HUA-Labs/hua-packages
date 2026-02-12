/**
 * Storage-backed Rate Limiter
 *
 * Same API as memory rate limiter but uses StorageAdapter (Redis, DB, etc.)
 * for distributed rate limiting across multiple instances.
 *
 * @example
 * ```typescript
 * import { createStorageRateLimiter } from '@hua-labs/security';
 * import { createRedisAdapter } from '@hua-labs/security/adapters';
 *
 * const adapter = createRedisAdapter({ client: redis });
 * const limiter = createStorageRateLimiter(adapter);
 *
 * const result = await limiter.checkRateLimit('user-123', '192.168.1.1');
 * ```
 */

import type { StorageAdapter } from '../adapters/storage';
import type { RateLimitResult } from './memory-rate-limiter';

const WINDOW_MS = 60_000; // 1 minute

async function checkLimit(
  adapter: StorageAdapter,
  key: string,
  limitPerMinute: number
): Promise<RateLimitResult> {
  const count = await adapter.increment(key, WINDOW_MS);
  const resetAt = new Date(Date.now() + WINDOW_MS);

  return {
    allowed: count <= limitPerMinute,
    remaining: Math.max(0, limitPerMinute - count),
    resetAt,
  };
}

export function createStorageRateLimiter(adapter: StorageAdapter) {
  async function checkUserRateLimit(
    userId: string,
    limitPerMinute: number = 10
  ): Promise<RateLimitResult> {
    return checkLimit(adapter, `ratelimit:user:${userId}`, limitPerMinute);
  }

  async function checkIpRateLimit(
    ip: string,
    limitPerMinute: number = 100
  ): Promise<RateLimitResult> {
    return checkLimit(adapter, `ratelimit:ip:${ip}`, limitPerMinute);
  }

  async function checkRateLimit(
    userId: string | null,
    ip: string,
    options?: { userLimitPerMinute?: number; ipLimitPerMinute?: number }
  ): Promise<RateLimitResult> {
    const ipLimitPerMinute = options?.ipLimitPerMinute ?? 100;
    const userLimitPerMinute = options?.userLimitPerMinute ?? 10;

    const ipResult = await checkIpRateLimit(ip, ipLimitPerMinute);
    if (!ipResult.allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: ipResult.resetAt,
        blockedBy: 'ip',
      };
    }

    if (userId) {
      const userResult = await checkUserRateLimit(userId, userLimitPerMinute);
      if (!userResult.allowed) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: userResult.resetAt,
          blockedBy: 'user',
        };
      }
      return {
        allowed: true,
        remaining: Math.min(userResult.remaining, ipResult.remaining),
        resetAt: userResult.resetAt,
      };
    }

    return {
      allowed: true,
      remaining: ipResult.remaining,
      resetAt: ipResult.resetAt,
    };
  }

  return {
    checkUserRateLimit,
    checkIpRateLimit,
    checkRateLimit,
  };
}
