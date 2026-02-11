import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LazyLoader } from '../core/lazy-loader';
import { I18nResourceManager } from '../core/i18n-resource';

describe('LazyLoader', () => {
  let loader: LazyLoader;

  beforeEach(() => {
    loader = LazyLoader.getInstance();
    // Reset the resource manager cache
    I18nResourceManager.getInstance().invalidateCache();
    loader.invalidateCache();
  });

  describe('getInstance', () => {
    it('should return singleton', () => {
      expect(LazyLoader.getInstance()).toBe(LazyLoader.getInstance());
    });
  });

  describe('loadOnDemand', () => {
    it('should load and return translations', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ key: 'value' });
      const result = await loader.loadOnDemand('ko', 'common', mockLoader);
      expect(result).toEqual({ key: 'value' });
    });

    it('should deduplicate concurrent loads', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ key: 'value' });
      const [r1, r2] = await Promise.all([
        loader.loadOnDemand('ko', 'dedup', mockLoader),
        loader.loadOnDemand('ko', 'dedup', mockLoader),
      ]);
      expect(r1).toEqual({ key: 'value' });
      expect(r2).toEqual({ key: 'value' });
      // Should only call loader once (via resource manager dedup)
      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('should return cached data on subsequent calls', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ cached: true });
      await loader.loadOnDemand('ko', 'cached', mockLoader);
      const result = await loader.loadOnDemand('ko', 'cached', mockLoader);
      expect(result).toEqual({ cached: true });
      expect(mockLoader).toHaveBeenCalledTimes(1);
    });
  });

  describe('preloadNamespace', () => {
    it('should preload a namespace', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ preloaded: true });
      await loader.preloadNamespace('ko', 'preload', mockLoader);
      // Should be available immediately
      const result = await loader.loadOnDemand('ko', 'preload', mockLoader);
      expect(result).toEqual({ preloaded: true });
    });

    it('should skip already preloaded namespaces', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ data: true });
      await loader.preloadNamespace('ko', 'skip', mockLoader);
      await loader.preloadNamespace('ko', 'skip', mockLoader);
      // Loader should be called only once
      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('should silently fail on error', async () => {
      const mockLoader = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(loader.preloadNamespace('ko', 'error', mockLoader)).resolves.toBeUndefined();
    });
  });

  describe('preloadMultipleNamespaces', () => {
    it('should preload multiple namespaces concurrently', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ multi: true });
      await loader.preloadMultipleNamespaces('ko', ['ns1', 'ns2', 'ns3'], mockLoader);
      expect(mockLoader).toHaveBeenCalledTimes(3);
    });
  });

  describe('getLoadStats', () => {
    it('should return loading statistics', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ stat: true });
      await loader.loadOnDemand('ko', 'stats', mockLoader);
      const stats = loader.getLoadStats();
      expect(stats.loadHistorySize).toBeGreaterThanOrEqual(1);
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate specific namespace', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ data: 'v1' });
      await loader.loadOnDemand('ko', 'inv', mockLoader);
      loader.invalidateCache('ko', 'inv');
      // After invalidation, should call loader again
      mockLoader.mockResolvedValue({ data: 'v2' });
      const result = await loader.loadOnDemand('ko', 'inv', mockLoader);
      expect(result).toEqual({ data: 'v2' });
    });

    it('should invalidate all cache when no args', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ data: true });
      await loader.loadOnDemand('ko', 'all1', mockLoader);
      await loader.loadOnDemand('ko', 'all2', mockLoader);
      loader.invalidateCache();
      const stats = loader.getLoadStats();
      expect(stats.preloadedCount).toBe(0);
    });
  });
});
