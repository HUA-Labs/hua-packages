export type TranslationRecord = Record<string, unknown>;

export type TranslationLoader = (
  language: string,
  namespace: string
) => Promise<TranslationRecord>;

/**
 * 캐시 무효화 함수 타입
 */
export interface CacheInvalidation {
  /**
   * 특정 언어/네임스페이스의 캐시 무효화
   * @param language - 언어 코드 (선택적, 없으면 모든 언어)
   * @param namespace - 네임스페이스 (선택적, 없으면 모든 네임스페이스)
   */
  invalidate?: (language?: string, namespace?: string) => void;
  /**
   * 전체 캐시 클리어
   */
  clear?: () => void;
}

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
  /** 재시도 횟수 (기본값: 0, 재시도 안 함) */
  retryCount?: number;
  /** 재시도 지연 시간 (밀리초, 기본값: 1000) */
  retryDelay?: number;
  /**
   * 개발 모드에서 자동 캐시 무효화
   * 기본값: true (개발 모드에서만)
   * 개발 중 번역 파일 변경 시 캐시를 자동으로 무효화하여 최신 번역을 즉시 반영
   */
  autoInvalidateInDev?: boolean;
}

export interface PreloadOptions {
  logger?: Pick<typeof console, 'log' | 'warn'>;
  suppressErrors?: boolean;
}

export type DefaultTranslations = Record<
  string,
  Record<string, TranslationRecord>
>;

