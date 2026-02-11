import { describe, it, expect, vi, beforeEach } from 'vitest';
import { I18nResourceManager } from '../core/i18n-resource';

describe('I18nResourceManager', () => {
  let manager: I18nResourceManager;

  beforeEach(() => {
    // Get singleton and reset it
    manager = I18nResourceManager.getInstance();
    manager.invalidateCache();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const a = I18nResourceManager.getInstance();
      const b = I18nResourceManager.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('getCachedTranslations', () => {
    it('should call loader and cache result', async () => {
      const loader = vi.fn().mockResolvedValue({ greeting: '안녕하세요' });
      const result = await manager.getCachedTranslations('ko', 'common', loader);
      expect(result).toEqual({ greeting: '안녕하세요' });
      expect(loader).toHaveBeenCalledWith('ko', 'common');
    });

    it('should return cached result on second call', async () => {
      const loader = vi.fn().mockResolvedValue({ greeting: '안녕하세요' });
      await manager.getCachedTranslations('ko', 'common', loader);
      const result = await manager.getCachedTranslations('ko', 'common', loader);
      expect(result).toEqual({ greeting: '안녕하세요' });
      expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate concurrent requests', async () => {
      let resolvePromise: (value: any) => void;
      const loader = vi.fn().mockImplementation(() => new Promise(resolve => { resolvePromise = resolve; }));

      const p1 = manager.getCachedTranslations('ko', 'auth', loader);
      const p2 = manager.getCachedTranslations('ko', 'auth', loader);

      resolvePromise!({ login: '로그인' });

      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toEqual({ login: '로그인' });
      expect(r2).toEqual({ login: '로그인' });
      expect(loader).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCachedTranslationsSync', () => {
    it('should return null for uncached', () => {
      expect(manager.getCachedTranslationsSync('fr', 'common')).toBeNull();
    });

    it('should return cached data', async () => {
      const loader = vi.fn().mockResolvedValue({ key: 'value' });
      await manager.getCachedTranslations('ko', 'test', loader);
      expect(manager.getCachedTranslationsSync('ko', 'test')).toEqual({ key: 'value' });
    });
  });

  describe('getAllTranslationsForLanguage', () => {
    it('should return all namespaces for a language', async () => {
      const loader = vi.fn().mockImplementation(async (lang: string, ns: string) => ({ [`${ns}_key`]: 'value' }));
      await manager.getCachedTranslations('ko', 'common', loader);
      await manager.getCachedTranslations('ko', 'auth', loader);

      const all = manager.getAllTranslationsForLanguage('ko');
      expect(Object.keys(all)).toContain('common');
      expect(Object.keys(all)).toContain('auth');
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate specific language/namespace', async () => {
      const loader = vi.fn().mockResolvedValue({ key: 'value' });
      await manager.getCachedTranslations('ko', 'common', loader);
      manager.invalidateCache('ko', 'common');
      expect(manager.getCachedTranslationsSync('ko', 'common')).toBeNull();
    });

    it('should invalidate all namespaces for a language', async () => {
      const loader = vi.fn().mockResolvedValue({ key: 'value' });
      await manager.getCachedTranslations('ko', 'common', loader);
      await manager.getCachedTranslations('ko', 'auth', loader);
      manager.invalidateCache('ko');
      expect(manager.getCachedTranslationsSync('ko', 'common')).toBeNull();
      expect(manager.getCachedTranslationsSync('ko', 'auth')).toBeNull();
    });

    it('should invalidate all cache when no args', async () => {
      const loader = vi.fn().mockResolvedValue({ key: 'value' });
      await manager.getCachedTranslations('ko', 'common', loader);
      await manager.getCachedTranslations('en', 'common', loader);
      manager.invalidateCache();
      expect(manager.getCachedTranslationsSync('ko', 'common')).toBeNull();
      expect(manager.getCachedTranslationsSync('en', 'common')).toBeNull();
    });
  });

  describe('hydrateFromSSR', () => {
    it('should populate cache from SSR data', () => {
      manager.hydrateFromSSR({
        ko: { common: { title: '제목' } },
        en: { common: { title: 'Title' } },
      });
      expect(manager.getCachedTranslationsSync('ko', 'common')).toEqual({ title: '제목' });
      expect(manager.getCachedTranslationsSync('en', 'common')).toEqual({ title: 'Title' });
    });
  });

  describe('getCacheStats', () => {
    it('should track hits and misses', async () => {
      const loader = vi.fn().mockResolvedValue({ key: 'value' });
      await manager.getCachedTranslations('ko', 'stats', loader); // miss
      await manager.getCachedTranslations('ko', 'stats', loader); // hit
      const stats = manager.getCacheStats();
      expect(stats.misses).toBeGreaterThanOrEqual(1);
      expect(stats.hits).toBeGreaterThanOrEqual(1);
    });
  });

  describe('setCacheLimit', () => {
    it('should evict entries when over limit', async () => {
      const loader = vi.fn().mockImplementation(async (lang: string, ns: string) => ({ key: ns }));
      await manager.getCachedTranslations('ko', 'ns1', loader);
      await manager.getCachedTranslations('ko', 'ns2', loader);
      await manager.getCachedTranslations('ko', 'ns3', loader);
      manager.setCacheLimit(1);
      const stats = manager.getCacheStats();
      expect(stats.size).toBe(1);
    });
  });
});
