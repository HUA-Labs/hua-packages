/**
 * Redis client singleton
 *
 * Single Redis connection shared by cache.ts, rate-limit.ts, etc.
 * Returns null when REDIS_URL is not set — each module handles the memory fallback.
 */

import { getServerEnv } from "../env/env";
import { logger } from "./logger";

let redisClient: import("ioredis").Redis | null = null;
let initialized = false;

/**
 * Returns Redis client (singleton)
 *
 * - REDIS_URL set: returns ioredis instance
 * - REDIS_URL not set / connection failure: returns null
 */
export function getRedisClient(): import("ioredis").Redis | null {
  if (initialized) return redisClient;
  initialized = true;

  try {
    let redisUrl: string | undefined;
    try {
      const serverEnv = getServerEnv();
      redisUrl = serverEnv.REDIS_URL;
    } catch {
      redisUrl = process.env.REDIS_URL;
    }

    if (redisUrl) {
      const Redis = require("ioredis");
      redisClient = new Redis(redisUrl, {
        connectTimeout: 5000, // Connection timeout 5s (default 10s → faster cold start)
        maxRetriesPerRequest: 1, // 1 retry per request (default 20 → fast fallback)
        retryStrategy(times: number) {
          if (times > 3) return null; // Give up reconnecting after 3 failures
          return Math.min(times * 200, 1000); // 200ms, 400ms, 600ms
        },
        lazyConnect: false, // Start connecting immediately (background)
        enableOfflineQueue: true, // Queue commands while connecting
      });
      logger.info("Redis client connecting");
    } else {
      logger.warn("REDIS_URL not set — using memory fallback");
    }
  } catch (error) {
    logger.warn("Redis connection failed — using memory fallback", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return redisClient;
}
