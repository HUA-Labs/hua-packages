import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStorageRateLimiter } from '../rate-limit/storage-rate-limiter';
import type { StorageAdapter } from '../adapters/storage';

function createMockAdapter(): StorageAdapter {
  const counters = new Map<string, number>();

  return {
    get: vi.fn(async () => null),
    set: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    increment: vi.fn(async (key: string) => {
      const current = counters.get(key) ?? 0;
      const next = current + 1;
      counters.set(key, next);
      return next;
    }),
  };
}

describe('storage-rate-limiter', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
  });

  describe('checkUserRateLimit', () => {
    it('should allow requests within limit', async () => {
      const limiter = createStorageRateLimiter(adapter);
      const result = await limiter.checkUserRateLimit('user-1', 10);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should block when user limit exceeded', async () => {
      const limiter = createStorageRateLimiter(adapter);
      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        await limiter.checkUserRateLimit('user-1', 5);
      }
      const result = await limiter.checkUserRateLimit('user-1', 5);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should use default limit of 10', async () => {
      const limiter = createStorageRateLimiter(adapter);
      const result = await limiter.checkUserRateLimit('user-1');
      expect(result.remaining).toBe(9); // 10 - 1
    });

    it('should use correct key prefix', async () => {
      const limiter = createStorageRateLimiter(adapter);
      await limiter.checkUserRateLimit('user-123');
      expect(adapter.increment).toHaveBeenCalledWith('ratelimit:user:user-123', 60000);
    });
  });

  describe('checkIpRateLimit', () => {
    it('should allow requests within limit', async () => {
      const limiter = createStorageRateLimiter(adapter);
      const result = await limiter.checkIpRateLimit('1.2.3.4', 100);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should block when IP limit exceeded', async () => {
      const limiter = createStorageRateLimiter(adapter);
      for (let i = 0; i < 3; i++) {
        await limiter.checkIpRateLimit('1.2.3.4', 3);
      }
      const result = await limiter.checkIpRateLimit('1.2.3.4', 3);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should use default limit of 100', async () => {
      const limiter = createStorageRateLimiter(adapter);
      const result = await limiter.checkIpRateLimit('1.2.3.4');
      expect(result.remaining).toBe(99); // 100 - 1
    });
  });

  describe('checkRateLimit', () => {
    it('should check both IP and user limits', async () => {
      const limiter = createStorageRateLimiter(adapter);
      const result = await limiter.checkRateLimit('user-1', '1.2.3.4');
      expect(result.allowed).toBe(true);
      expect(adapter.increment).toHaveBeenCalledTimes(2);
    });

    it('should check only IP when userId is null', async () => {
      const limiter = createStorageRateLimiter(adapter);
      const result = await limiter.checkRateLimit(null, '1.2.3.4');
      expect(result.allowed).toBe(true);
      expect(adapter.increment).toHaveBeenCalledTimes(1);
    });

    it('should return blockedBy: ip when IP blocked', async () => {
      const limiter = createStorageRateLimiter(adapter);
      for (let i = 0; i < 2; i++) {
        await limiter.checkRateLimit('user-1', '1.2.3.4', { ipLimitPerMinute: 2 });
      }
      // Reset mock to track only the blocking call
      vi.mocked(adapter.increment).mockClear();

      // Mock the IP counter to be over limit
      vi.mocked(adapter.increment).mockResolvedValueOnce(3);
      const result = await limiter.checkRateLimit('user-1', '1.2.3.4', { ipLimitPerMinute: 2 });
      expect(result.allowed).toBe(false);
      expect(result.blockedBy).toBe('ip');
    });

    it('should return blockedBy: user when user blocked', async () => {
      const limiter = createStorageRateLimiter(adapter);

      // IP passes, user fails
      vi.mocked(adapter.increment)
        .mockResolvedValueOnce(1) // IP check passes
        .mockResolvedValueOnce(11); // user check fails (limit 10)
      const result = await limiter.checkRateLimit('user-1', '1.2.3.4');
      expect(result.allowed).toBe(false);
      expect(result.blockedBy).toBe('user');
    });

    it('should use custom limits from options', async () => {
      const limiter = createStorageRateLimiter(adapter);
      await limiter.checkRateLimit('user-1', '1.2.3.4', {
        ipLimitPerMinute: 50,
        userLimitPerMinute: 5,
      });
      expect(adapter.increment).toHaveBeenCalledWith('ratelimit:ip:1.2.3.4', 60000);
      expect(adapter.increment).toHaveBeenCalledWith('ratelimit:user:user-1', 60000);
    });

    it('should return minimum remaining of user and IP', async () => {
      const limiter = createStorageRateLimiter(adapter);
      vi.mocked(adapter.increment)
        .mockResolvedValueOnce(8)   // IP: remaining = 100-8 = 92
        .mockResolvedValueOnce(7);  // User: remaining = 10-7 = 3
      const result = await limiter.checkRateLimit('user-1', '1.2.3.4');
      expect(result.remaining).toBe(3);
    });

    it('should return resetAt as a Date', async () => {
      const limiter = createStorageRateLimiter(adapter);
      const before = Date.now();
      const result = await limiter.checkRateLimit('user-1', '1.2.3.4');
      const after = Date.now();
      expect(result.resetAt).toBeInstanceOf(Date);
      expect(result.resetAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.resetAt.getTime()).toBeLessThanOrEqual(after + 60_000 + 100);
    });
  });
});
