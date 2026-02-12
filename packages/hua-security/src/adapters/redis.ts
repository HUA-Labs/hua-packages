/**
 * Redis Storage Adapter
 *
 * DI pattern — inject any Redis-like client (ioredis, @upstash/redis, node-redis).
 * This package has zero Redis dependencies.
 *
 * @example
 * ```typescript
 * import Redis from 'ioredis';
 * import { createRedisAdapter } from '@hua-labs/security/adapters';
 *
 * const redis = new Redis(process.env.REDIS_URL);
 * const adapter = createRedisAdapter({ client: redis });
 * ```
 */

import type { StorageAdapter } from './storage';

/**
 * Minimal Redis client interface.
 * Compatible with ioredis, @upstash/redis, node-redis.
 */
export interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
  del(key: string | string[]): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
}

export interface RedisAdapterConfig {
  client: RedisLikeClient;
  /** Key prefix to avoid collisions (default: 'hua:') */
  keyPrefix?: string;
}

export function createRedisAdapter(config: RedisAdapterConfig): StorageAdapter {
  const { client, keyPrefix = 'hua:' } = config;

  function prefixKey(key: string): string {
    return `${keyPrefix}${key}`;
  }

  return {
    async get(key: string): Promise<string | null> {
      return client.get(prefixKey(key));
    },

    async set(key: string, value: string, ttlMs?: number): Promise<void> {
      const prefixed = prefixKey(key);
      if (ttlMs !== undefined && ttlMs > 0) {
        await client.set(prefixed, value, 'PX', ttlMs);
      } else {
        await client.set(prefixed, value);
      }
    },

    async delete(key: string): Promise<void> {
      await client.del(prefixKey(key));
    },

    async increment(key: string, ttlMs?: number): Promise<number> {
      const prefixed = prefixKey(key);
      const count = await client.incr(prefixed);

      // Set TTL only on first increment (when count is 1)
      if (count === 1 && ttlMs !== undefined && ttlMs > 0) {
        const ttlSeconds = Math.ceil(ttlMs / 1000);
        await client.expire(prefixed, ttlSeconds);
      }

      return count;
    },
  };
}
