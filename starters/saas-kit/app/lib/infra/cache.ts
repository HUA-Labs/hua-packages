/**
 * Caching system
 *
 * High-performance caching system using Redis
 * Falls back to in-memory cache when Redis is unavailable
 */

import { getRedisClient } from "./redis";

// In-memory cache (fallback)
const memoryCache = new Map<string, { value: any; expires: number }>();

// Cache TTL settings
const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  LIST: 60, // 1 minute
  RESULT: 1800, // 30 minutes
  NOTIFICATIONS: 30, // 30 seconds
  API_RESPONSE: 300, // 5 minutes
} as const;

/**
 * Generate cache key
 */
function generateCacheKey(
  prefix: string,
  identifier: string,
  params?: any,
): string {
  const paramStr = params ? JSON.stringify(params) : "";
  return `${prefix}:${identifier}:${paramStr}`;
}

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    if (redis) {
      // Fetch from Redis
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } else {
      // Fetch from in-memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.value;
      } else if (cached) {
        memoryCache.delete(key); // Remove expired cache entry
      }
      return null;
    }
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
}

/**
 * Store value in cache
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 300,
): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (redis) {
      // Store in Redis
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } else {
      // Store in in-memory cache
      memoryCache.set(key, {
        value,
        expires: Date.now() + ttlSeconds * 1000,
      });
      return true;
    }
  } catch (error) {
    console.error("Cache write error:", error);
    return false;
  }
}

/**
 * Delete cache entry
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.del(key);
    } else {
      memoryCache.delete(key);
    }
    return true;
  } catch (error) {
    console.error("Cache delete error:", error);
    return false;
  }
}

/**
 * Delete cache entries by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      // Pattern match in in-memory cache
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
          memoryCache.delete(key);
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Cache pattern delete error:", error);
    return false;
  }
}

/**
 * Cache wrapper function
 */
export async function withCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttlSeconds: number = 300,
): Promise<T> {
  // Check cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss — execute function
  const result = await fetchFunction();

  // Store result in cache
  await setCache(key, result, ttlSeconds);

  return result;
}

/**
 * Generate per-user cache key
 */
export function getUserCacheKey(
  userId: string,
  type: string,
  params?: any,
): string {
  return generateCacheKey(`user:${userId}`, type, params);
}

/**
 * Generate global cache key
 */
export function getGlobalCacheKey(type: string, params?: any): string {
  return generateCacheKey("global", type, params);
}

/**
 * Cache statistics
 */
export async function getCacheStats(): Promise<{
  type: "redis" | "memory";
  size: number;
  keys: string[];
}> {
  try {
    const redis = getRedisClient();
    if (redis) {
      const keys = await redis.keys("*");
      return {
        type: "redis",
        size: keys.length,
        keys: keys.slice(0, 10), // Show first 10 keys only
      };
    } else {
      return {
        type: "memory",
        size: memoryCache.size,
        keys: Array.from(memoryCache.keys()).slice(0, 10),
      };
    }
  } catch (error) {
    console.error("Cache stats error:", error);
    return { type: "memory", size: 0, keys: [] };
  }
}

export { CACHE_TTL };
