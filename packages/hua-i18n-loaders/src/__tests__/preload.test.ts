import { describe, it, expect, vi, beforeEach } from 'vitest';
import { preloadNamespaces, warmFallbackLanguages } from '../preload';
import type { TranslationLoader, TranslationRecord } from '../types';

describe('preloadNamespaces', () => {
  let mockLoader: TranslationLoader;

  beforeEach(() => {
    mockLoader = vi.fn();
  });

  it('should preload all namespaces successfully', async () => {
    const translations: TranslationRecord = { hello: 'world' };
    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(translations);

    const namespaces = ['common', 'auth', 'dashboard'];
    const result = await preloadNamespaces('en', namespaces, mockLoader);

    expect(result.fulfilled).toEqual(namespaces);
    expect(result.rejected).toEqual([]);
    expect(mockLoader).toHaveBeenCalledTimes(3);
    expect(mockLoader).toHaveBeenCalledWith('en', 'common');
    expect(mockLoader).toHaveBeenCalledWith('en', 'auth');
    expect(mockLoader).toHaveBeenCalledWith('en', 'dashboard');
  });

  it('should handle partial failures', async () => {
    const translations: TranslationRecord = { hello: 'world' };
    const error = new Error('Failed to load');

    (mockLoader as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(translations) // common succeeds
      .mockRejectedValueOnce(error) // auth fails
      .mockResolvedValueOnce(translations); // dashboard succeeds

    const namespaces = ['common', 'auth', 'dashboard'];
    const result = await preloadNamespaces('en', namespaces, mockLoader);

    expect(result.fulfilled).toEqual(['common', 'dashboard']);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]).toBe(error);
  });

  it('should log success messages', async () => {
    const translations: TranslationRecord = { hello: 'world' };
    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(translations);

    const logger = {
      log: vi.fn(),
      warn: vi.fn(),
    };

    const namespaces = ['common', 'auth'];
    await preloadNamespaces('en', namespaces, mockLoader, { logger });

    expect(logger.log).toHaveBeenCalledWith(
      '[i18n-loaders] Preloaded 2/2 namespaces for en'
    );
  });

  it('should log warning messages for failures', async () => {
    const error = new Error('Failed to load');
    (mockLoader as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ hello: 'world' })
      .mockRejectedValueOnce(error);

    const logger = {
      log: vi.fn(),
      warn: vi.fn(),
    };

    const namespaces = ['common', 'auth'];
    await preloadNamespaces('en', namespaces, mockLoader, { logger });

    expect(logger.log).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      '[i18n-loaders] Failed to preload 1 namespaces for en'
    );
  });

  it('should suppress error warnings when option is set', async () => {
    const error = new Error('Failed to load');
    (mockLoader as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    const logger = {
      log: vi.fn(),
      warn: vi.fn(),
    };

    const namespaces = ['common', 'auth'];
    await preloadNamespaces('en', namespaces, mockLoader, {
      logger,
      suppressErrors: true,
    });

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should handle empty namespace list', async () => {
    const result = await preloadNamespaces('en', [], mockLoader);

    expect(result.fulfilled).toEqual([]);
    expect(result.rejected).toEqual([]);
    expect(mockLoader).not.toHaveBeenCalled();
  });

  it('should call loader concurrently', async () => {
    const callOrder: string[] = [];

    (mockLoader as ReturnType<typeof vi.fn>).mockImplementation(
      async (language: string, namespace: string) => {
        callOrder.push(`start-${namespace}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
        callOrder.push(`end-${namespace}`);
        return {};
      }
    );

    const namespaces = ['common', 'auth', 'dashboard'];
    await preloadNamespaces('en', namespaces, mockLoader);

    // All starts should happen before any ends (concurrent execution)
    const firstEndIndex = callOrder.findIndex((item) => item.startsWith('end-'));
    const lastStartIndex = callOrder.reduce(
      (acc, item, idx) => (item.startsWith('start-') ? idx : acc),
      -1
    );

    expect(firstEndIndex).toBeGreaterThan(lastStartIndex);
  });
});

describe('warmFallbackLanguages', () => {
  let mockLoader: TranslationLoader;

  beforeEach(() => {
    mockLoader = vi.fn();
  });

  it('should preload all fallback languages', async () => {
    const translations: TranslationRecord = { hello: 'world' };
    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(translations);

    const languages = ['en', 'es', 'fr'];
    const namespaces = ['common', 'auth'];

    await warmFallbackLanguages('en', languages, namespaces, mockLoader);

    // Should preload es and fr (not en, as it's the current language)
    expect(mockLoader).toHaveBeenCalledTimes(4); // 2 languages * 2 namespaces
    expect(mockLoader).toHaveBeenCalledWith('es', 'common');
    expect(mockLoader).toHaveBeenCalledWith('es', 'auth');
    expect(mockLoader).toHaveBeenCalledWith('fr', 'common');
    expect(mockLoader).toHaveBeenCalledWith('fr', 'auth');
    expect(mockLoader).not.toHaveBeenCalledWith('en', expect.any(String));
  });

  it('should return empty array when no fallback languages', async () => {
    const languages = ['en'];
    const namespaces = ['common'];

    const result = await warmFallbackLanguages(
      'en',
      languages,
      namespaces,
      mockLoader
    );

    expect(result).toEqual([]);
    expect(mockLoader).not.toHaveBeenCalled();
  });

  it('should handle all languages being current language', async () => {
    const languages = ['en'];
    const namespaces = ['common', 'auth'];

    const result = await warmFallbackLanguages(
      'en',
      languages,
      namespaces,
      mockLoader
    );

    expect(result).toEqual([]);
    expect(mockLoader).not.toHaveBeenCalled();
  });

  it('should pass options to preloadNamespaces', async () => {
    const translations: TranslationRecord = { hello: 'world' };
    const error = new Error('Failed to load');

    (mockLoader as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(translations)
      .mockRejectedValueOnce(error);

    const logger = {
      log: vi.fn(),
      warn: vi.fn(),
    };

    const languages = ['en', 'es'];
    const namespaces = ['common'];

    await warmFallbackLanguages('en', languages, namespaces, mockLoader, {
      logger,
      suppressErrors: true,
    });

    expect(logger.log).toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled(); // suppressErrors is true
  });

  it('should return results for each fallback language', async () => {
    const translations: TranslationRecord = { hello: 'world' };
    const error = new Error('Failed to load');

    (mockLoader as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(translations) // es/common succeeds
      .mockRejectedValueOnce(error) // fr/common fails
      .mockResolvedValueOnce(translations); // ko/common succeeds

    const languages = ['en', 'es', 'fr', 'ko'];
    const namespaces = ['common'];

    const results = await warmFallbackLanguages(
      'en',
      languages,
      namespaces,
      mockLoader,
      { suppressErrors: true }
    );

    expect(results).toHaveLength(3); // es, fr, ko (excluding current language 'en')
    expect(results[0].fulfilled).toEqual(['common']);
    expect(results[1].rejected).toHaveLength(1);
    expect(results[2].fulfilled).toEqual(['common']);
  });

  it('should execute preloads concurrently for different languages', async () => {
    const callOrder: string[] = [];

    (mockLoader as ReturnType<typeof vi.fn>).mockImplementation(
      async (language: string) => {
        callOrder.push(`start-${language}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
        callOrder.push(`end-${language}`);
        return {};
      }
    );

    const languages = ['en', 'es', 'fr'];
    const namespaces = ['common'];

    await warmFallbackLanguages('en', languages, namespaces, mockLoader);

    // All starts should happen before any ends (concurrent execution)
    const firstEndIndex = callOrder.findIndex((item) => item.startsWith('end-'));
    const lastStartIndex = callOrder.reduce(
      (acc, item, idx) => (item.startsWith('start-') ? idx : acc),
      -1
    );

    expect(firstEndIndex).toBeGreaterThan(lastStartIndex);
  });
});
