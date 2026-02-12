import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRedisAdapter } from '../adapters/redis';
import type { RedisLikeClient } from '../adapters/redis';

function createMockRedisClient(): RedisLikeClient {
  const store = new Map<string, string>();
  const ttls = new Map<string, number>();

  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string, ..._args: unknown[]) => {
      store.set(key, value);
      return 'OK';
    }),
    del: vi.fn(async (key: string | string[]) => {
      const keys = Array.isArray(key) ? key : [key];
      let count = 0;
      for (const k of keys) {
        if (store.delete(k)) count++;
      }
      return count;
    }),
    incr: vi.fn(async (key: string) => {
      const current = parseInt(store.get(key) ?? '0', 10);
      const next = current + 1;
      store.set(key, String(next));
      return next;
    }),
    expire: vi.fn(async (key: string, seconds: number) => {
      ttls.set(key, seconds);
      return 1;
    }),
    ttl: vi.fn(async (key: string) => ttls.get(key) ?? -1),
  };
}

describe('redis-adapter', () => {
  let client: RedisLikeClient;

  beforeEach(() => {
    client = createMockRedisClient();
  });

  describe('createRedisAdapter', () => {
    it('should create an adapter with default prefix', () => {
      const adapter = createRedisAdapter({ client });
      expect(adapter).toBeDefined();
      expect(adapter.get).toBeTypeOf('function');
      expect(adapter.set).toBeTypeOf('function');
      expect(adapter.delete).toBeTypeOf('function');
      expect(adapter.increment).toBeTypeOf('function');
    });

    it('should prefix keys with default "hua:" prefix', async () => {
      const adapter = createRedisAdapter({ client });
      await adapter.set('test', 'value');
      expect(client.set).toHaveBeenCalledWith('hua:test', 'value');
    });

    it('should use custom key prefix', async () => {
      const adapter = createRedisAdapter({ client, keyPrefix: 'app:' });
      await adapter.set('test', 'value');
      expect(client.set).toHaveBeenCalledWith('app:test', 'value');
    });
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      const adapter = createRedisAdapter({ client });
      const result = await adapter.get('missing');
      expect(result).toBeNull();
    });

    it('should return stored value', async () => {
      const adapter = createRedisAdapter({ client });
      await adapter.set('key', 'hello');
      const result = await adapter.get('key');
      expect(result).toBe('hello');
    });
  });

  describe('set', () => {
    it('should set without TTL', async () => {
      const adapter = createRedisAdapter({ client });
      await adapter.set('key', 'value');
      expect(client.set).toHaveBeenCalledWith('hua:key', 'value');
    });

    it('should set with TTL in milliseconds', async () => {
      const adapter = createRedisAdapter({ client });
      await adapter.set('key', 'value', 5000);
      expect(client.set).toHaveBeenCalledWith('hua:key', 'value', 'PX', 5000);
    });

    it('should ignore TTL of 0', async () => {
      const adapter = createRedisAdapter({ client });
      await adapter.set('key', 'value', 0);
      expect(client.set).toHaveBeenCalledWith('hua:key', 'value');
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      const adapter = createRedisAdapter({ client });
      await adapter.set('key', 'value');
      await adapter.delete('key');
      expect(client.del).toHaveBeenCalledWith('hua:key');
    });
  });

  describe('increment', () => {
    it('should increment and return count', async () => {
      const adapter = createRedisAdapter({ client });
      const count1 = await adapter.increment('counter');
      expect(count1).toBe(1);
      const count2 = await adapter.increment('counter');
      expect(count2).toBe(2);
    });

    it('should set TTL on first increment', async () => {
      const adapter = createRedisAdapter({ client });
      await adapter.increment('counter', 60000);
      expect(client.expire).toHaveBeenCalledWith('hua:counter', 60);
    });

    it('should not reset TTL on subsequent increments', async () => {
      const adapter = createRedisAdapter({ client });
      await adapter.increment('counter', 60000);
      await adapter.increment('counter', 60000);
      // expire called only once (count === 1)
      expect(client.expire).toHaveBeenCalledTimes(1);
    });

    it('should not set TTL when not provided', async () => {
      const adapter = createRedisAdapter({ client });
      await adapter.increment('counter');
      expect(client.expire).not.toHaveBeenCalled();
    });
  });
});
