import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiTranslationLoader } from '../api-loader';
import type { TranslationRecord } from '../types';

describe('createApiTranslationLoader', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should fetch and return translations', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader({
        baseUrl: 'https://example.com',
        translationApiPath: '/api/translations',
      });

      const result = await loader('en', 'common');

      expect(result).toEqual(translations);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/translations/en/common',
        expect.objectContaining({
          cache: 'no-store',
        })
      );
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const loader = createApiTranslationLoader();

      await expect(loader('en', 'common')).rejects.toThrow(
        '[i18n-loaders] Failed to load en/common (404)'
      );
    });
  });

  describe('Caching', () => {
    it('should return cached data on subsequent requests', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader({
        cacheTtlMs: 5 * 60 * 1000,
      });

      const result1 = await loader('en', 'common');
      const result2 = await loader('en', 'common');

      expect(result1).toEqual(translations);
      expect(result2).toEqual(translations);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should refetch after cache TTL expires', async () => {
      const translations1: TranslationRecord = { hello: 'world' };
      const translations2: TranslationRecord = { hello: 'updated' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => translations1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => translations2,
        });

      const loader = createApiTranslationLoader({
        cacheTtlMs: 1000,
      });

      const result1 = await loader('en', 'common');
      expect(result1).toEqual(translations1);

      // Advance time past TTL
      vi.advanceTimersByTime(1001);

      const result2 = await loader('en', 'common');
      expect(result2).toEqual(translations2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should skip cache when disableCache is true', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader({
        disableCache: true,
      });

      await loader('en', 'common');
      await loader('en', 'common');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('In-flight request deduplication', () => {
    it('should deduplicate concurrent requests', async () => {
      vi.useRealTimers(); // Use real timers for this test

      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => translations,
              });
            }, 10);
          })
      );

      const loader = createApiTranslationLoader({
        baseUrl: 'https://example.com',
      });

      const [result1, result2, result3] = await Promise.all([
        loader('en', 'common'),
        loader('en', 'common'),
        loader('en', 'common'),
      ]);

      expect(result1).toEqual(translations);
      expect(result2).toEqual(translations);
      expect(result3).toEqual(translations);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      vi.useFakeTimers(); // Restore fake timers
    });

    it('should not deduplicate different language/namespace combinations', async () => {
      const translations1: TranslationRecord = { hello: 'world' };
      const translations2: TranslationRecord = { hello: 'mundo' };

      mockFetch.mockImplementation((url) => {
        const urlStr = typeof url === 'string' ? url : url.toString();
        if (urlStr.includes('/en/')) {
          return Promise.resolve({
            ok: true,
            json: async () => translations1,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => translations2,
        });
      });

      const loader = createApiTranslationLoader({
        baseUrl: 'https://example.com',
      });

      const [result1, result2] = await Promise.all([
        loader('en', 'common'),
        loader('es', 'common'),
      ]);

      expect(result1).toEqual(translations1);
      expect(result2).toEqual(translations2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry logic', () => {
    it('should retry on 5xx errors with exponential backoff', async () => {
      vi.useRealTimers(); // Use real timers for retry test

      const translations: TranslationRecord = { hello: 'world' };
      let callCount = 0;

      mockFetch.mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          const error = new Error('Internal Server Error') as Error & { status: number };
          error.status = 500;
          throw error;
        }
        return {
          ok: true,
          json: async () => translations,
        } as Response;
      });

      const loader = createApiTranslationLoader({
        baseUrl: 'https://example.com',
        retryCount: 2,
        retryDelay: 10, // Short delay for faster test
      });

      const result = await loader('en', 'common');

      expect(result).toEqual(translations);
      expect(callCount).toBe(3);

      vi.useFakeTimers(); // Restore fake timers
    });

    it('should retry on network errors', async () => {
      vi.useRealTimers(); // Use real timers for retry test

      const translations: TranslationRecord = { hello: 'world' };
      let callCount = 0;

      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => translations,
        });
      });

      const loader = createApiTranslationLoader({
        baseUrl: 'https://example.com',
        retryCount: 1,
        retryDelay: 10, // Short delay for faster test
      });

      const result = await loader('en', 'common');

      expect(result).toEqual(translations);
      expect(callCount).toBe(2);

      vi.useFakeTimers(); // Restore fake timers
    });

    it('should not retry on 4xx errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const loader = createApiTranslationLoader({
        retryCount: 2,
        retryDelay: 100,
      });

      await expect(loader('en', 'common')).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error after max retries exceeded', async () => {
      vi.useRealTimers(); // Use real timers for retry test

      let callCount = 0;
      mockFetch.mockImplementation(async () => {
        callCount++;
        const error = new Error('Internal Server Error') as Error & { status: number };
        error.status = 500;
        throw error;
      });

      const logger = {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const loader = createApiTranslationLoader({
        baseUrl: 'https://example.com',
        retryCount: 2,
        retryDelay: 10, // Short delay for faster test
        logger,
      });

      await expect(loader('en', 'common')).rejects.toThrow();
      expect(callCount).toBe(3); // Initial + 2 retries
      expect(logger.warn).toHaveBeenCalled();

      vi.useFakeTimers(); // Restore fake timers
    });
  });

  describe('URL building', () => {
    it('should use baseUrl in server environment', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader({
        baseUrl: 'https://example.com',
        translationApiPath: '/api/translations',
      });

      await loader('en', 'common');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/translations/en/common',
        expect.any(Object)
      );
    });

    it('should sanitize namespace in URL', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader({
        baseUrl: 'https://example.com',
      });

      await loader('en', 'my@namespace#test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/translations/en/mynamespacetest',
        expect.any(Object)
      );
    });

    it('should fall back to NEXT_PUBLIC_SITE_URL', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
      process.env.NEXT_PUBLIC_SITE_URL = 'https://site.com';

      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader();

      await loader('en', 'common');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://site.com/api/translations/en/common',
        expect.any(Object)
      );

      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    });

    it('should fall back to VERCEL_URL', async () => {
      const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      const originalVercelUrl = process.env.VERCEL_URL;

      delete process.env.NEXT_PUBLIC_SITE_URL;
      process.env.VERCEL_URL = 'vercel-app.vercel.app';

      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader();

      await loader('en', 'common');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://vercel-app.vercel.app/api/translations/en/common',
        expect.any(Object)
      );

      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
      process.env.VERCEL_URL = originalVercelUrl;
    });

    it('should use localFallbackBaseUrl as final fallback', async () => {
      const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      const originalVercelUrl = process.env.VERCEL_URL;

      delete process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.VERCEL_URL;

      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader({
        localFallbackBaseUrl: 'http://localhost:4000',
      });

      await loader('en', 'common');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/translations/en/common',
        expect.any(Object)
      );

      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
      process.env.VERCEL_URL = originalVercelUrl;
    });
  });

  describe('Cache invalidation', () => {
    it('should invalidate specific language/namespace', async () => {
      const translations1: TranslationRecord = { hello: 'world' };
      const translations2: TranslationRecord = { hello: 'updated' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => translations1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => translations2,
        });

      const loader = createApiTranslationLoader();

      const result1 = await loader('en', 'common');
      expect(result1).toEqual(translations1);

      loader.invalidate('en', 'common');

      const result2 = await loader('en', 'common');
      expect(result2).toEqual(translations2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should invalidate all namespaces for a language', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader();

      await loader('en', 'common');
      await loader('en', 'auth');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      loader.invalidate('en');

      await loader('en', 'common');
      await loader('en', 'auth');
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should invalidate specific namespace across all languages', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader();

      await loader('en', 'common');
      await loader('es', 'common');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      loader.invalidate(undefined, 'common');

      await loader('en', 'common');
      await loader('es', 'common');
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should clear entire cache', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader();

      await loader('en', 'common');
      await loader('en', 'auth');
      await loader('es', 'common');
      expect(mockFetch).toHaveBeenCalledTimes(3);

      loader.clear();

      await loader('en', 'common');
      await loader('en', 'auth');
      await loader('es', 'common');
      expect(mockFetch).toHaveBeenCalledTimes(6);
    });
  });

  describe('Custom fetcher', () => {
    it('should use custom fetcher when provided', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      const customFetcher = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader({
        fetcher: customFetcher,
      });

      await loader('en', 'common');

      expect(customFetcher).toHaveBeenCalledTimes(1);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Custom requestInit', () => {
    it('should use static requestInit', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader({
        requestInit: {
          headers: {
            'X-Custom-Header': 'test',
          },
        },
      });

      await loader('en', 'common');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'X-Custom-Header': 'test',
          },
        })
      );
    });

    it('should use function-based requestInit', async () => {
      const translations: TranslationRecord = { hello: 'world' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => translations,
      });

      const loader = createApiTranslationLoader({
        requestInit: (language, namespace) => ({
          headers: {
            'X-Language': language,
            'X-Namespace': namespace,
          },
        }),
      });

      await loader('en', 'common');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'X-Language': 'en',
            'X-Namespace': 'common',
          },
        })
      );
    });
  });

  describe('Logger', () => {
    it('should use custom logger', async () => {
      const logger = {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const loader = createApiTranslationLoader({
        logger,
      });

      await expect(loader('en', 'common')).rejects.toThrow();

      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
