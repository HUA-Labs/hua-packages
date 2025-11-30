import { ApiLoaderOptions, TranslationLoader, TranslationRecord } from './types';

interface CacheEntry {
  data: TranslationRecord;
  expiresAt: number;
}

const FIVE_MINUTES = 5 * 60 * 1000;

const defaultFetcher = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, init);

export function createApiTranslationLoader(
  options: ApiLoaderOptions = {}
): TranslationLoader {
  const translationApiPath = options.translationApiPath ?? '/api/translations';
  const cacheTtlMs = options.cacheTtlMs ?? FIVE_MINUTES;
  const fetcher = options.fetcher ?? defaultFetcher;
  const logger = options.logger ?? console;
  const localCache = new Map<string, CacheEntry>();
  const inFlightRequests = new Map<string, Promise<TranslationRecord>>();

  const buildUrl = (language: string, namespace: string) => {
    const safeNamespace = namespace.replace(/[^a-zA-Z0-9-_]/g, '');
    const path = `${translationApiPath}/${language}/${safeNamespace}`;

    if (typeof window !== 'undefined') {
      return path;
    }

    if (options.baseUrl) {
      return `${options.baseUrl}${path}`;
    }

    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
    }

    if (process.env.VERCEL_URL) {
      const vercelUrl = process.env.VERCEL_URL.startsWith('http')
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL}`;
      return `${vercelUrl}${path}`;
    }

    const fallbackBase = options.localFallbackBaseUrl ?? 'http://localhost:3000';
    return `${fallbackBase}${path}`;
  };

  const getRequestInit = (language: string, namespace: string): RequestInit => {
    if (typeof options.requestInit === 'function') {
      return options.requestInit(language, namespace) ?? {};
    }

    return options.requestInit ?? {};
  };

  const getCached = (cacheKey: string) => {
    if (options.disableCache) {
      return null;
    }

    const entry = localCache.get(cacheKey);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      localCache.delete(cacheKey);
      return null;
    }

    return entry.data;
  };

  const setCached = (cacheKey: string, data: TranslationRecord) => {
    if (options.disableCache) {
      return;
    }

    localCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + cacheTtlMs
    });
  };

  const loadTranslations: TranslationLoader = async (language, namespace) => {
    const cacheKey = `${language}:${namespace}`;
    const cached = getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    const url = buildUrl(language, namespace);
    const requestInit = getRequestInit(language, namespace);

    const requestPromise = fetcher(url, {
      cache: 'no-store',
      ...requestInit
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `[i18n-loaders] Failed to load ${language}/${namespace} (${response.status})`
          );
        }

        const data = (await response.json()) as TranslationRecord;
        setCached(cacheKey, data);
        return data;
      })
      .catch((error) => {
        logger.warn?.(
          '[i18n-loaders] translation fetch failed',
          language,
          namespace,
          error
        );
        throw error;
      })
      .finally(() => {
        inFlightRequests.delete(cacheKey);
      });

    inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  };

  return loadTranslations;
}

