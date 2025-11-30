export type TranslationRecord = Record<string, unknown>;

export type TranslationLoader = (
  language: string,
  namespace: string
) => Promise<TranslationRecord>;

export interface ApiLoaderOptions {
  translationApiPath?: string;
  baseUrl?: string;
  localFallbackBaseUrl?: string;
  cacheTtlMs?: number;
  disableCache?: boolean;
  requestInit?:
    | RequestInit
    | ((language: string, namespace: string) => RequestInit | undefined);
  fetcher?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  logger?: Pick<typeof console, 'log' | 'warn' | 'error'>;
}

export interface PreloadOptions {
  logger?: Pick<typeof console, 'log' | 'warn'>;
  suppressErrors?: boolean;
}

export type DefaultTranslations = Record<
  string,
  Record<string, TranslationRecord>
>;

