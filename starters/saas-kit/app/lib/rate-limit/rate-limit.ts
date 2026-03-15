/**
 * Rate limit check and management
 *
 * Rate limiting for submission requests
 * - Per user: 10 req/min
 * - Per IP: global rate limit
 *
 * With Redis: INCR + EXPIRE atomic counter (global rate limit)
 * Without Redis: In-Memory Map fallback (independent per instance)
 *
 * @remarks
 * Edge Runtime compatible: no prisma dependency, pure JavaScript only
 */

import { getRedisClient } from "../infra/redis";

// ── Redis key prefixes ─────────────────────────────────────────
const RATE_LIMIT_PREFIX = "ratelimit";
const PENALTY_PREFIX = "ratelimit:penalty";
const WINDOW_SECONDS = 60; // 1-minute window

// ── In-Memory fallback ────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

const userRateLimitMap = new Map<string, RateLimitEntry>();
const ipRateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Clean up expired rate limit entries (in-memory fallback only)
 */
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

// Lazy cleanup probability (in-memory fallback only; Redis expires via TTL)
const CLEANUP_PROBABILITY = 0.01;

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// ── Redis-based Rate Limit ────────────────────────────────────

/**
 * Rate limit check using Redis INCR + EXPIRE pattern
 *
 * - Atomic counter: accurate counting even under concurrent requests
 * - Auto TTL expiry: no cleanup needed
 * - Globally shared: same counter across all serverless instances
 */
async function checkRateLimitRedis(
  redis: import("ioredis").Redis,
  keyType: string,
  identifier: string,
  limitPerMinute: number,
): Promise<RateLimitResult> {
  const key = `${RATE_LIMIT_PREFIX}:${keyType}:${identifier}`;

  // Check penalized users (user type only)
  if (keyType === "user") {
    const penaltyKey = `${PENALTY_PREFIX}:${identifier}`;
    const penaltyLimit = await redis.get(penaltyKey);
    if (penaltyLimit !== null) {
      limitPerMinute = parseInt(penaltyLimit, 10);
    }
  }

  // INCR: starts at 0 if key doesn't exist → returns 1
  const count = await redis.incr(key);

  // Set TTL on first request
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  // Get TTL → calculate resetAt
  const ttl = await redis.ttl(key);
  const resetAt = new Date(Date.now() + Math.max(ttl, 1) * 1000);

  return {
    allowed: count <= limitPerMinute,
    remaining: Math.max(0, limitPerMinute - count),
    resetAt,
  };
}

// ── In-Memory-based Rate Limit ───────────────────────────────

function checkRateLimitMemory(
  map: Map<string, RateLimitEntry>,
  key: string,
  limitPerMinute: number,
): RateLimitResult {
  // Lazy Cleanup
  if (Math.random() < CLEANUP_PROBABILITY) {
    cleanupExpiredRateLimits();
  }

  const now = new Date();
  let entry = map.get(key);

  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: new Date(now.getTime() + WINDOW_SECONDS * 1000),
    };
    map.set(key, entry);
  }

  entry.count++;

  return {
    allowed: entry.count <= limitPerMinute,
    remaining: Math.max(0, limitPerMinute - entry.count),
    resetAt: entry.resetAt,
  };
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Per-user rate limit check
 *
 * @param userId User ID
 * @param limitPerMinute Limit per minute (default: 10; penalized users get stricter limits)
 */
export async function checkUserRateLimit(
  userId: string,
  limitPerMinute: number = 10,
): Promise<RateLimitResult> {
  try {
    const redis = getRedisClient();
    if (redis) {
      return await checkRateLimitRedis(redis, "user", userId, limitPerMinute);
    }
  } catch {
    // Redis failure — fall back to memory
  }

  // Memory fallback: check penalty
  const key = `user:${userId}`;
  let effectiveLimit = limitPerMinute;
  if (userPenaltyLimitMap) {
    const penaltyLimit = userPenaltyLimitMap.get(key);
    if (penaltyLimit !== undefined) {
      effectiveLimit = penaltyLimit;
    }
  }

  return checkRateLimitMemory(userRateLimitMap, key, effectiveLimit);
}

/**
 * Per-IP rate limit check (global)
 *
 * @param ip IP address
 * @param limitPerMinute Limit per minute (default: 100)
 */
export async function checkIpRateLimit(
  ip: string,
  limitPerMinute: number = 100,
): Promise<RateLimitResult> {
  try {
    const redis = getRedisClient();
    if (redis) {
      return await checkRateLimitRedis(redis, "ip", ip, limitPerMinute);
    }
  } catch {
    // Redis failure — fall back to memory
  }

  return checkRateLimitMemory(ipRateLimitMap, `ip:${ip}`, limitPerMinute);
}

/**
 * Unified rate limit check
 *
 * @param userId User ID (nullable)
 * @param ip IP address
 * @param userAgent User-Agent (optional, for future VPN/mobile detection)
 */
export async function checkRateLimit(
  userId: string | null,
  ip: string,
  userAgent?: string | null,
): Promise<RateLimitResult> {
  const ipLimitPerMinute = 100;
  const userLimitPerMinute = 10;

  // Global IP-based check
  const ipResult = await checkIpRateLimit(ip, ipLimitPerMinute);
  if (!ipResult.allowed) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: ipResult.resetAt,
    };
  }

  // Per-user check (logged-in users only)
  if (userId) {
    const userResult = await checkUserRateLimit(userId, userLimitPerMinute);
    if (!userResult.allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: userResult.resetAt,
      };
    }
  }

  return {
    allowed: true,
    remaining: userId ? userLimitPerMinute : ipLimitPerMinute,
    resetAt: new Date(Date.now() + WINDOW_SECONDS * 1000),
  };
}

/**
 * Set per-user rate limit (for penalties)
 *
 * Applies a stricter rate limit to a user on abuse detection.
 *
 * @param userId User ID
 * @param limitPerMinute Limit per minute (default: 3; regular users get 10)
 */
export function setUserRateLimit(
  userId: string,
  limitPerMinute: number = 3,
): void {
  // Store penalty key in Redis (24-hour TTL)
  try {
    const redis = getRedisClient();
    if (redis) {
      const penaltyKey = `${PENALTY_PREFIX}:${userId}`;
      redis.set(penaltyKey, String(limitPerMinute), "EX", 86400); // 24h
      return;
    }
  } catch {
    // Redis failure — fall back to memory
  }

  // Memory fallback
  const key = `user:${userId}`;
  const now = new Date();

  const entry = userRateLimitMap.get(key);
  if (entry) {
    if (entry.resetAt < now) {
      entry.count = 0;
      entry.resetAt = new Date(now.getTime() + WINDOW_SECONDS * 1000);
    }
  } else {
    userRateLimitMap.set(key, {
      count: 0,
      resetAt: new Date(now.getTime() + WINDOW_SECONDS * 1000),
    });
  }

  if (!userPenaltyLimitMap) {
    userPenaltyLimitMap = new Map<string, number>();
  }
  userPenaltyLimitMap.set(key, limitPerMinute);
}

/**
 * Rate Limit Map for penalized users (in-memory fallback only)
 * key: `user:${userId}`, value: limit per minute
 */
let userPenaltyLimitMap: Map<string, number> | null = null;

/**
 * Rate limit exceeded error
 */
export class RateLimitExceededError extends Error {
  constructor(
    message: string,
    public readonly resetAt: Date,
  ) {
    super(message);
    this.name = "RateLimitExceededError";
  }
}
