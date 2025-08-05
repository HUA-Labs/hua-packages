export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

export interface TranslationData {
  [namespace: string]: TranslationNamespace;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  tone?: 'emotional' | 'encouraging' | 'calm' | 'gentle' | 'formal' | 'technical' | 'informal';
  formality?: 'informal' | 'casual' | 'formal' | 'polite';
}

// 더 구체적인 설정 타입 정의
export interface I18nConfig {
  defaultLanguage: string;
  fallbackLanguage?: string;
  supportedLanguages: LanguageConfig[];
  namespaces?: string[];
  loadTranslations: (language: string, namespace: string) => Promise<TranslationNamespace>;
  // 개발 모드 설정
  debug?: boolean;
  // 번역 키가 없을 때의 동작
  missingKeyHandler?: (key: string, language: string, namespace: string) => string;
  // 번역 로딩 실패 시 동작
  errorHandler?: (error: Error, language: string, namespace: string) => void;
  // 캐시 설정
  cacheOptions?: {
    maxSize?: number;
    ttl?: number; // Time to live in milliseconds
  };
  // 성능 설정
  performanceOptions?: {
    preloadAll?: boolean;
    lazyLoad?: boolean;
  };
  // 에러 처리 설정
  errorHandling?: {
    recoveryStrategy?: ErrorRecoveryStrategy;
    logging?: ErrorLoggingConfig;
    userFriendlyMessages?: boolean;
    suppressErrors?: boolean;
  };
  // 자동 언어 전환 이벤트 처리 (withDefaultConfig용)
  autoLanguageSync?: boolean;
}

// 에러 타입 정의
export interface TranslationError extends Error {
  code: 'MISSING_KEY' | 'LOAD_FAILED' | 'INVALID_KEY' | 'NETWORK_ERROR' | 'INITIALIZATION_ERROR' | 'VALIDATION_ERROR' | 'CACHE_ERROR' | 'FALLBACK_LOAD_FAILED' | 'INITIALIZATION_FAILED' | 'RETRY_FAILED';
  language?: string;
  namespace?: string;
  key?: string;
  originalError?: Error;
  retryCount?: number;
  maxRetries?: number;
  timestamp: number;
  context?: Record<string, unknown>;
}

// 에러 복구 전략
export interface ErrorRecoveryStrategy {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
  shouldRetry: (error: TranslationError) => boolean;
  onRetry: (error: TranslationError, attempt: number) => void;
  onMaxRetriesExceeded: (error: TranslationError) => void;
}

// 에러 로깅 설정
export interface ErrorLoggingConfig {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug';
  includeStack: boolean;
  includeContext: boolean;
  customLogger?: (error: TranslationError) => void;
}

// 사용자 친화적 에러 메시지
export interface UserFriendlyError {
  code: string;
  message: string;
  suggestion?: string;
  action?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 캐시 엔트리 타입
export interface CacheEntry {
  data: TranslationNamespace;
  timestamp: number;
  ttl: number;
}

// 로딩 상태 타입
export interface LoadingState {
  isLoading: boolean;
  error: TranslationError | null;
  progress?: {
    loaded: number;
    total: number;
  };
}

// 번역 결과 타입
export interface TranslationResult {
  text: string;
  language: string;
  namespace: string;
  key: string;
  isFallback: boolean;
  cacheHit: boolean;
}

export interface I18nContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  // hua-api 스타일의 간단한 번역 함수
  t: (key: string, language?: string) => string;
  // 파라미터가 있는 번역 함수
  tWithParams: (key: string, params?: TranslationParams, language?: string) => string;
  // 기존 비동기 번역 함수 (하위 호환성)
  tAsync: (key: string, params?: TranslationParams) => Promise<string>;
  // 기존 동기 번역 함수 (하위 호환성)
  tSync: (key: string, namespace?: string, params?: TranslationParams) => string;
  isLoading: boolean;
  error: TranslationError | null;
  supportedLanguages: LanguageConfig[];
  // 초기화 상태
  isInitialized: boolean;
  // 개발자 도구
  debug: {
    getCurrentLanguage: () => string;
    getSupportedLanguages: () => string[];
    getLoadedNamespaces: () => string[];
    getAllTranslations: () => Record<string, Record<string, any>>;
    isReady: () => boolean;
    getInitializationError: () => TranslationError | null;
    clearCache: () => void;
    reloadTranslations: () => Promise<void>;
    getCacheStats: () => {
      size: number;
      hits: number;
      misses: number;
    };
  };
}

export interface TranslationParams {
  [key: string]: string | number;
} 

// 타입 안전한 번역 키 시스템 (단순화된 버전)
export type TranslationKey<T> = T extends Record<string, any>
  ? {
      [K in keyof T]: T[K] extends string
        ? K
        : T[K] extends Record<string, any>
          ? `${K & string}.${TranslationKey<T[K]> & string}`
          : never;
    }[keyof T]
  : never;

// 타입 안전한 번역 함수들
export interface TypedI18nContextType<T extends TranslationData> extends Omit<I18nContextType, 't' | 'tWithParams' | 'tSync'> {
  // 타입 안전한 번역 함수
  t: <K extends TranslationKey<T>>(key: K, language?: string) => string;
  tWithParams: <K extends TranslationKey<T>>(key: K, params?: TranslationParams, language?: string) => string;
  tSync: <K extends TranslationKey<T>>(key: K, namespace?: string, params?: TranslationParams) => string;
}

// 간단한 번역 키 타입 (무한 재귀 방지)
export type SimpleTranslationKey = string;

// 고급 번역 키 타입 (제한된 깊이)
export type TranslationKeyLegacy<T extends Record<string, any>, D extends number = 3> = 
  [D] extends [never] 
    ? never 
    : T extends Record<string, any>
      ? {
          [K in keyof T]: T[K] extends string 
            ? K 
            : T[K] extends Record<string, any>
              ? `${K & string}.${TranslationKeyLegacy<T[K], Prev<D>> & string}` 
              : never;
        }[keyof T]
      : never;

type Prev<T extends number> = T extends 0 ? never : T extends 1 ? 0 : T extends 2 ? 1 : T extends 3 ? 2 : never;

// 유틸리티 타입들
export type ExtractTranslationKeys<T> = T extends Record<string, any>
  ? {
      [K in keyof T]: T[K] extends string
        ? K
        : T[K] extends Record<string, any>
          ? `${K & string}.${ExtractTranslationKeys<T[K]> & string}`
          : never;
    }[keyof T]
  : never;

// 네임스페이스별 타입 정의를 위한 헬퍼
export type NamespaceKeys<T extends TranslationData, N extends keyof T> = ExtractTranslationKeys<T[N]>;

// 타입 안전한 번역 키 생성 헬퍼
export const createTranslationKey = <T extends TranslationData, N extends keyof T, K extends NamespaceKeys<T, N>>(
  namespace: N,
  key: K
): `${N & string}.${K & string}` => `${String(namespace)}.${String(key)}` as any; 

// 타입 가드 함수들
export function isTranslationNamespace(value: unknown): value is TranslationNamespace {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isLanguageConfig(value: unknown): value is LanguageConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as LanguageConfig).code === 'string' &&
    typeof (value as LanguageConfig).name === 'string' &&
    typeof (value as LanguageConfig).nativeName === 'string'
  );
}

export function isTranslationError(value: unknown): value is TranslationError {
  return (
    value instanceof Error &&
    typeof (value as TranslationError).code === 'string' &&
    ['MISSING_KEY', 'LOAD_FAILED', 'INVALID_KEY', 'NETWORK_ERROR', 'INITIALIZATION_ERROR'].includes(
      (value as TranslationError).code
    )
  );
}

// 설정 검증 함수
export function validateI18nConfig(config: unknown): config is I18nConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const c = config as I18nConfig;
  
  return (
    typeof c.defaultLanguage === 'string' &&
    Array.isArray(c.supportedLanguages) &&
    c.supportedLanguages.every(isLanguageConfig) &&
    typeof c.loadTranslations === 'function'
  );
}

// 에러 처리 유틸리티 함수들
export function createTranslationError(
  code: TranslationError['code'],
  message: string,
  originalError?: Error,
  context?: {
    language?: string;
    namespace?: string;
    key?: string;
    retryCount?: number;
    maxRetries?: number;
  }
): TranslationError {
  const error = new Error(message) as TranslationError;
  error.code = code;
  error.language = context?.language;
  error.namespace = context?.namespace;
  error.key = context?.key;
  error.originalError = originalError;
  error.retryCount = context?.retryCount || 0;
  error.maxRetries = context?.maxRetries || 3;
  error.timestamp = Date.now();
  error.name = 'TranslationError';
  return error;
}

// 사용자 친화적 에러 메시지 생성
export function createUserFriendlyError(error: TranslationError): UserFriendlyError {
  const errorMessages: Record<TranslationError['code'], UserFriendlyError> = {
    MISSING_KEY: {
      code: 'MISSING_KEY',
      message: '번역 키를 찾을 수 없습니다',
      suggestion: '번역 파일에 해당 키가 있는지 확인해주세요',
      action: '번역 파일 업데이트',
      severity: 'low'
    },
    LOAD_FAILED: {
      code: 'LOAD_FAILED',
      message: '번역 파일을 불러오는데 실패했습니다',
      suggestion: '네트워크 연결과 파일 경로를 확인해주세요',
      action: '재시도',
      severity: 'medium'
    },
    INVALID_KEY: {
      code: 'INVALID_KEY',
      message: '잘못된 번역 키 형식입니다',
      suggestion: '키 형식을 "namespace.key" 형태로 입력해주세요',
      action: '키 형식 수정',
      severity: 'low'
    },
    NETWORK_ERROR: {
      code: 'NETWORK_ERROR',
      message: '네트워크 오류가 발생했습니다',
      suggestion: '인터넷 연결을 확인하고 다시 시도해주세요',
      action: '재시도',
      severity: 'high'
    },
    INITIALIZATION_ERROR: {
      code: 'INITIALIZATION_ERROR',
      message: '번역 시스템 초기화에 실패했습니다',
      suggestion: '설정을 확인하고 페이지를 새로고침해주세요',
      action: '페이지 새로고침',
      severity: 'critical'
    },
    VALIDATION_ERROR: {
      code: 'VALIDATION_ERROR',
      message: '설정 검증에 실패했습니다',
      suggestion: '번역 설정을 확인해주세요',
      action: '설정 수정',
      severity: 'medium'
    },
    CACHE_ERROR: {
      code: 'CACHE_ERROR',
      message: '캐시 처리 중 오류가 발생했습니다',
      suggestion: '캐시를 초기화하고 다시 시도해주세요',
      action: '캐시 초기화',
      severity: 'low'
    },
    FALLBACK_LOAD_FAILED: {
      code: 'FALLBACK_LOAD_FAILED',
      message: '폴백 언어 로딩에 실패했습니다',
      suggestion: '폴백 언어 파일을 확인해주세요',
      action: '폴백 언어 파일 수정',
      severity: 'medium'
    },
    INITIALIZATION_FAILED: {
      code: 'INITIALIZATION_FAILED',
      message: '초기화에 실패했습니다',
      suggestion: '설정을 확인하고 다시 시도해주세요',
      action: '설정 확인',
      severity: 'critical'
    },
    RETRY_FAILED: {
      code: 'RETRY_FAILED',
      message: '재시도에 실패했습니다',
      suggestion: '네트워크 연결을 확인해주세요',
      action: '재시도',
      severity: 'high'
    }
  };

  return errorMessages[error.code];
}

// 에러 복구 가능 여부 확인
export function isRecoverableError(error: TranslationError): boolean {
  const recoverableCodes: TranslationError['code'][] = [
    'LOAD_FAILED',
    'NETWORK_ERROR',
    'CACHE_ERROR'
  ];
  
  return recoverableCodes.includes(error.code) && 
         (error.retryCount || 0) < (error.maxRetries || 3);
}

// 기본 에러 복구 전략
export const defaultErrorRecoveryStrategy: ErrorRecoveryStrategy = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  shouldRetry: isRecoverableError,
  onRetry: (error: TranslationError, attempt: number) => {
    console.warn(`Retrying translation operation (attempt ${attempt}/${error.maxRetries}):`, error.message);
  },
  onMaxRetriesExceeded: (error: TranslationError) => {
    console.error('Max retries exceeded for translation operation:', error.message);
  }
};

// 기본 에러 로깅 설정
export const defaultErrorLoggingConfig: ErrorLoggingConfig = {
  enabled: true,
  level: 'error',
  includeStack: true,
  includeContext: true,
  customLogger: undefined
};

// 에러 로깅 함수
export function logTranslationError(
  error: TranslationError, 
  config: ErrorLoggingConfig = defaultErrorLoggingConfig
): void {
  if (!config.enabled) return;

  const logData: Record<string, unknown> = {
    code: error.code,
    message: error.message,
    timestamp: error.timestamp,
    retryCount: error.retryCount,
    maxRetries: error.maxRetries
  };

  if (config.includeContext) {
    logData.language = error.language;
    logData.namespace = error.namespace;
    logData.key = error.key;
    logData.context = error.context;
  }

  if (config.includeStack && error.stack) {
    logData.stack = error.stack;
  }

  if (config.customLogger) {
    config.customLogger(error);
  } else {
    switch (config.level) {
      case 'error':
        console.error('Translation Error:', logData);
        break;
      case 'warn':
        console.warn('Translation Warning:', logData);
        break;
      case 'info':
        console.info('Translation Info:', logData);
        break;
      case 'debug':
        console.debug('Translation Debug:', logData);
        break;
    }
  }
} 