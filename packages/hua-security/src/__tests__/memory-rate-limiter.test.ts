import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMemoryRateLimiter, RateLimitExceededError } from '../rate-limit/memory-rate-limiter';

describe('memory-rate-limiter', () => {
  let limiter: ReturnType<typeof createMemoryRateLimiter>;

  beforeEach(() => {
    limiter = createMemoryRateLimiter({ cleanupProbability: 0 });
  });

  describe('checkUserRateLimit', () => {
    it('should allow requests within limit', async () => {
      const result = await limiter.checkUserRateLimit('user-1', 3);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should block requests exceeding limit', async () => {
      await limiter.checkUserRateLimit('user-1', 2);
      await limiter.checkUserRateLimit('user-1', 2);
      const result = await limiter.checkUserRateLimit('user-1', 2);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track different users independently', async () => {
      await limiter.checkUserRateLimit('user-1', 1);
      await limiter.checkUserRateLimit('user-1', 1);
      const result = await limiter.checkUserRateLimit('user-2', 1);
      expect(result.allowed).toBe(true);
    });

    it('should return correct remaining count', async () => {
      const r1 = await limiter.checkUserRateLimit('u1', 5);
      expect(r1.remaining).toBe(4);
      const r2 = await limiter.checkUserRateLimit('u1', 5);
      expect(r2.remaining).toBe(3);
    });

    it('should have resetAt in the future', async () => {
      const result = await limiter.checkUserRateLimit('u1', 5);
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return 0 remaining when blocked', async () => {
      await limiter.checkUserRateLimit('u1', 1);
      const r = await limiter.checkUserRateLimit('u1', 1);
      expect(r.remaining).toBe(0);
      expect(r.allowed).toBe(false);
    });
  });

  describe('checkIpRateLimit', () => {
    it('should allow requests within limit', async () => {
      const result = await limiter.checkIpRateLimit('192.168.1.1', 5);
      expect(result.allowed).toBe(true);
    });

    it('should block requests exceeding limit', async () => {
      for (let i = 0; i < 3; i++) {
        await limiter.checkIpRateLimit('10.0.0.1', 2);
      }
      const result = await limiter.checkIpRateLimit('10.0.0.1', 2);
      expect(result.allowed).toBe(false);
    });

    it('should track different IPs independently', async () => {
      for (let i = 0; i < 3; i++) await limiter.checkIpRateLimit('10.0.0.1', 2);
      const result = await limiter.checkIpRateLimit('10.0.0.2', 2);
      expect(result.allowed).toBe(true);
    });

    it('should return correct remaining', async () => {
      const r = await limiter.checkIpRateLimit('10.0.0.1', 10);
      expect(r.remaining).toBe(9);
    });
  });

  describe('checkRateLimit', () => {
    it('should check both IP and user limits', async () => {
      const result = await limiter.checkRateLimit('user-1', '192.168.1.1');
      expect(result.allowed).toBe(true);
    });

    it('should work with null userId (IP only)', async () => {
      const result = await limiter.checkRateLimit(null, '192.168.1.1');
      expect(result.allowed).toBe(true);
    });

    it('should return actual remaining (not max) for user+ip', async () => {
      await limiter.checkRateLimit('u1', '1.1.1.1', { userLimitPerMinute: 5, ipLimitPerMinute: 100 });
      const r = await limiter.checkRateLimit('u1', '1.1.1.1', { userLimitPerMinute: 5, ipLimitPerMinute: 100 });
      expect(r.remaining).toBeLessThan(5);
      expect(r.remaining).toBe(3);
    });

    it('should return IP remaining when no userId', async () => {
      const r = await limiter.checkRateLimit(null, '2.2.2.2', { ipLimitPerMinute: 10 });
      expect(r.remaining).toBe(9);
    });

    it('should block when IP limit exceeded even with userId', async () => {
      for (let i = 0; i < 3; i++) await limiter.checkRateLimit('u1', '3.3.3.3', { ipLimitPerMinute: 2, userLimitPerMinute: 100 });
      const r = await limiter.checkRateLimit('u1', '3.3.3.3', { ipLimitPerMinute: 2, userLimitPerMinute: 100 });
      expect(r.allowed).toBe(false);
    });
  });

  describe('time expiry', () => {
    it('should reset after window expires', async () => {
      vi.useFakeTimers();
      const freshLimiter = createMemoryRateLimiter({ cleanupProbability: 0 });
      await freshLimiter.checkUserRateLimit('u1', 1);
      const blocked = await freshLimiter.checkUserRateLimit('u1', 1);
      expect(blocked.allowed).toBe(false);
      vi.advanceTimersByTime(61000); // advance past 60s window
      const after = await freshLimiter.checkUserRateLimit('u1', 1);
      expect(after.allowed).toBe(true);
      vi.useRealTimers();
    });
  });

  describe('cleanup', () => {
    it('should create limiter with custom cleanup probability', () => {
      const l = createMemoryRateLimiter({ cleanupProbability: 1.0 }); // always cleanup
      expect(l).toBeDefined();
    });

    it('should not throw during cleanup', async () => {
      const l = createMemoryRateLimiter({ cleanupProbability: 1.0 });
      await l.checkUserRateLimit('u1', 5);
      await l.checkIpRateLimit('1.1.1.1', 5);
      // Next call triggers cleanup
      await expect(l.checkUserRateLimit('u2', 5)).resolves.toBeDefined();
    });
  });

  describe('setUserRateLimit', () => {
    it('should apply penalty limits', async () => {
      limiter.setUserRateLimit('user-1', 1);
      await limiter.checkUserRateLimit('user-1', 10);
      const result = await limiter.checkUserRateLimit('user-1', 10);
      expect(result.allowed).toBe(false);
    });

    it('should apply penalty to specific user only', async () => {
      limiter.setUserRateLimit('u1', 1);
      await limiter.checkUserRateLimit('u1', 100);
      const u1 = await limiter.checkUserRateLimit('u1', 100);
      expect(u1.allowed).toBe(false);
      const u2 = await limiter.checkUserRateLimit('u2', 100);
      expect(u2.allowed).toBe(true);
    });
  });

  describe('edge limits', () => {
    it('should handle limit of 0', async () => {
      const r = await limiter.checkUserRateLimit('u1', 0);
      expect(r.allowed).toBe(false);
    });

    it('should handle very large limit', async () => {
      const r = await limiter.checkUserRateLimit('u1', 1000000);
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(999999);
    });
  });

  describe('reset', () => {
    it('should clear all limits', async () => {
      await limiter.checkUserRateLimit('user-1', 1);
      await limiter.checkUserRateLimit('user-1', 1);
      limiter.reset();
      const result = await limiter.checkUserRateLimit('user-1', 1);
      expect(result.allowed).toBe(true);
    });
  });

  describe('RateLimitExceededError', () => {
    it('should have correct name and resetAt', () => {
      const resetAt = new Date();
      const error = new RateLimitExceededError('too many', resetAt);
      expect(error.name).toBe('RateLimitExceededError');
      expect(error.resetAt).toBe(resetAt);
      expect(error.message).toBe('too many');
    });
  });
});
