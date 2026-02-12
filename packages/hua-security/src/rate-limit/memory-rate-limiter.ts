/**
 * Memory-based Rate Limiter
 *
 * Edge Runtime compatible, zero external dependencies.
 * Uses in-memory Map with lazy cleanup for serverless environments.
 *
 * WARNING: In serverless environments, rate limits are not shared across instances.
 * For production, implement StorageAdapter with Redis or similar.
 */

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

/**
 * Rate Limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  /** Which limiter blocked the request (only set when allowed=false) */
  blockedBy?: 'user' | 'ip';
}

/**
 * Rate Limit exceeded error
 */
export class RateLimitExceededError extends Error {
  constructor(
    message: string,
    public readonly resetAt: Date
  ) {
    super(message);
    this.name = 'RateLimitExceededError';
  }
}

/**
 * Memory Rate Limiter configuration
 */
export interface MemoryRateLimiterConfig {
  /** Cleanup probability per request (default: 0.01 = 1%) */
  cleanupProbability?: number;
}

/**
 * Create a memory-based rate limiter instance
 *
 * @example
 * ```typescript
 * const limiter = createMemoryRateLimiter();
 *
 * // Check user rate limit
 * const result = await limiter.checkUserRateLimit('user-123', 10);
 * if (!result.allowed) throw new RateLimitExceededError('Too many requests', result.resetAt);
 *
 * // Check IP rate limit
 * const ipResult = await limiter.checkIpRateLimit('192.168.1.1', 100);
 *
 * // Combined check
 * const combined = await limiter.checkRateLimit('user-123', '192.168.1.1');
 * ```
 */
export function createMemoryRateLimiter(config?: MemoryRateLimiterConfig) {
  const cleanupProbability = config?.cleanupProbability ?? 0.01;

  const userRateLimitMap = new Map<string, RateLimitEntry>();
  const ipRateLimitMap = new Map<string, RateLimitEntry>();
  let userPenaltyLimitMap: Map<string, number> | null = null;

  function cleanupExpiredRateLimits(): void {
    const now = new Date();

    for (const [key, entry] of userRateLimitMap.entries()) {
      if (entry.resetAt < now) {
        userRateLimitMap.delete(key);
      }
    }

    for (const [key, entry] of ipRateLimitMap.entries()) {
      if (entry.resetAt < now) {
        ipRateLimitMap.delete(key);
      }
    }
  }

  function maybeLazyCleanup(): void {
    if (Math.random() < cleanupProbability) {
      cleanupExpiredRateLimits();
    }
  }

  async function checkUserRateLimit(
    userId: string,
    limitPerMinute: number = 10
  ): Promise<RateLimitResult> {
    maybeLazyCleanup();

    const now = new Date();
    const key = `user:${userId}`;

    let effectiveLimit = limitPerMinute;
    if (userPenaltyLimitMap) {
      const penaltyLimit = userPenaltyLimitMap.get(key);
      if (penaltyLimit !== undefined) {
        effectiveLimit = penaltyLimit;
      }
    }

    let entry = userRateLimitMap.get(key);

    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: new Date(now.getTime() + 60 * 1000),
      };
      userRateLimitMap.set(key, entry);
    }

    entry.count++;

    return {
      allowed: entry.count <= effectiveLimit,
      remaining: Math.max(0, effectiveLimit - entry.count),
      resetAt: entry.resetAt,
    };
  }

  async function checkIpRateLimit(
    ip: string,
    limitPerMinute: number = 100
  ): Promise<RateLimitResult> {
    maybeLazyCleanup();

    const now = new Date();
    const key = `ip:${ip}`;

    let entry = ipRateLimitMap.get(key);

    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: new Date(now.getTime() + 60 * 1000),
      };
      ipRateLimitMap.set(key, entry);
    }

    entry.count++;

    return {
      allowed: entry.count <= limitPerMinute,
      remaining: Math.max(0, limitPerMinute - entry.count),
      resetAt: entry.resetAt,
    };
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

  function setUserRateLimit(
    userId: string,
    limitPerMinute: number = 3
  ): void {
    const key = `user:${userId}`;
    const now = new Date();

    const entry = userRateLimitMap.get(key);

    if (entry) {
      if (entry.resetAt < now) {
        entry.count = 0;
        entry.resetAt = new Date(now.getTime() + 60 * 1000);
      }
    } else {
      userRateLimitMap.set(key, {
        count: 0,
        resetAt: new Date(now.getTime() + 60 * 1000),
      });
    }

    if (!userPenaltyLimitMap) {
      userPenaltyLimitMap = new Map<string, number>();
    }
    userPenaltyLimitMap.set(key, limitPerMinute);
  }

  function reset(): void {
    userRateLimitMap.clear();
    ipRateLimitMap.clear();
    userPenaltyLimitMap = null;
  }

  return {
    checkUserRateLimit,
    checkIpRateLimit,
    checkRateLimit,
    setUserRateLimit,
    reset,
  };
}
