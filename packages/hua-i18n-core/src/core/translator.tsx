import { 
  I18nConfig, 
  TranslationNamespace, 
  TranslationError, 
  CacheEntry, 
  TranslationResult,
  isTranslationNamespace,
  validateI18nConfig,
  createTranslationError,
  logTranslationError,
  defaultErrorRecoveryStrategy,
  defaultErrorLoggingConfig,
  isRecoverableError
} from '../types';

export interface TranslatorInterface {
  translate(key: string, language?: string): string;
  setLanguage(lang: string): void;
  getCurrentLanguage(): string;
  initialize(): Promise<void>;
  isReady(): boolean;
  debug(): any;
}

export class Translator implements TranslatorInterface {
  private cache = new Map<string, CacheEntry>();
  private loadedNamespaces = new Set<string>();
  private loadingPromises = new Map<string, Promise<TranslationNamespace>>();
  private allTranslations: Record<string, Record<string, TranslationNamespace>> = {};
  private isInitialized = false;
  private initializationError: TranslationError | null = null;
  private config: I18nConfig;
  private currentLang: string = 'en';
  private cacheStats = {
    hits: 0,
    misses: 0,
  };

  constructor(config: I18nConfig) {
    if (!validateI18nConfig(config)) {
      throw new Error('Invalid I18nConfig provided');
    }
    
    this.config = {
      fallbackLanguage: 'en',
      namespaces: ['common'],
      debug: false,
      missingKeyHandler: (key: string) => key,
      errorHandler: (error: Error) => console.warn('Translation error:', error),
      ...config
    };
    this.currentLang = config.defaultLanguage;
  }

  /**
   * 모든 번역 데이터를 미리 로드 (hua-api 스타일)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Ensure allTranslations is initialized
      if (!this.allTranslations) {
        this.allTranslations = {};
      }
      
      const languages = [this.currentLang];
      if (this.config.fallbackLanguage && this.config.fallbackLanguage !== this.currentLang) {
        languages.push(this.config.fallbackLanguage);
      }

      if (this.config.debug) {
        console.log('Initializing translator with languages:', languages);
        console.log('Current language:', this.currentLang);
        console.log('Config namespaces:', this.config.namespaces);
      }

      for (const language of languages) {
        if (this.config.debug) {
          console.log('Processing language:', language);
        }
        
        if (!this.allTranslations[language]) {
          this.allTranslations[language] = {};
        }
        
        for (const namespace of this.config.namespaces || []) {
          if (this.config.debug) {
            console.log('Loading namespace:', namespace, 'for language:', language);
          }
          
          try {
            const data = await this.safeLoadTranslations(language, namespace);
            
            if (this.config.debug) {
              console.log('Loaded data for', language, namespace, ':', data);
            }
            
            this.allTranslations[language][namespace] = data;
            this.setCacheEntry(`${language}:${namespace}`, data);
          } catch (error) {
            const translationError = error as TranslationError;
            
            if (this.config.errorHandler) {
              this.config.errorHandler(translationError, language, namespace);
            }
            
            // 폴백 언어로 시도
            if (this.config.fallbackLanguage && language !== this.config.fallbackLanguage) {
              try {
                const fallbackData = await this.safeLoadTranslations(this.config.fallbackLanguage, namespace);
                this.allTranslations[language][namespace] = fallbackData;
                this.setCacheEntry(`${language}:${namespace}`, fallbackData);
              } catch (fallbackError) {
                const fallbackTranslationError = fallbackError as TranslationError;
                
                if (this.config.errorHandler) {
                  this.config.errorHandler(fallbackTranslationError, this.config.fallbackLanguage, namespace);
                }
                
                // 최종 폴백: 빈 객체
                this.allTranslations[language][namespace] = {};
              }
            } else {
              // 폴백 언어도 실패하면 빈 객체
              this.allTranslations[language][namespace] = {};
            }
          }
        }
      }

      this.isInitialized = true;
      this.initializationError = null;
      
      if (this.config.debug) {
        console.log('Translator initialized successfully:', this.allTranslations);
      }
    } catch (error) {
      this.initializationError = this.createTranslationError(
        'INITIALIZATION_ERROR',
        error as Error
      );
      
      if (this.config.errorHandler) {
        this.config.errorHandler(this.initializationError, this.currentLang, 'initialization');
      }
      
      throw this.initializationError;
    }
  }

  /**
   * hua-api 스타일의 간단한 번역 함수
   */
  translate(key: string, language?: string): string {
    if (!this.isInitialized) {
      if (this.initializationError) {
        if (this.config.debug) {
          console.warn('Translator not initialized due to error:', this.initializationError.message);
        }
      } else {
        if (this.config.debug) {
          console.warn('Translator not initialized. Call initialize() first.');
        }
      }
      return this.config.missingKeyHandler ? this.config.missingKeyHandler(key, language || this.currentLang, 'common') : key;
    }

    if (!key || typeof key !== 'string') {
      if (this.config.debug) {
        console.warn('Invalid translation key:', key);
      }
      return '';
    }

    const targetLanguage = language || this.currentLang;

    try {
      // 키를 네임스페이스와 키로 분리
      const parts = key.split('.');
      if (parts.length === 1) {
        // 단일 키인 경우 common 네임스페이스에서 찾기
        return this.findInNamespace('common', parts[0], targetLanguage);
      }
      // 첫 번째 부분을 네임스페이스로, 나머지를 키로
      const namespace = parts[0];
      const translationKey = parts.slice(1).join('.');
      return this.findInNamespace(namespace, translationKey, targetLanguage);
    } catch (error) {
      if (this.config.debug) {
        console.error('Translation error for key:', key, error);
      }
      return this.config.missingKeyHandler ? this.config.missingKeyHandler(key, targetLanguage, key) : key;
    }
  }

  /**
   * 특정 네임스페이스에서 키 찾기 (개선된 fallback 체인)
   */
  private findInNamespace(namespace: string, key: string, language: string): string {
    try {
      // 1차: 요청된 언어에서 찾기
      const value = this.getNestedValue(this.allTranslations[language]?.[namespace], key);
      if (typeof value === 'string') {
        return value;
      }

      // 2차: 폴백 언어에서 찾기 (en → ko → [MISSING] 흐름)
      if (language !== this.config.fallbackLanguage && this.config.fallbackLanguage) {
        const fallbackValue = this.getNestedValue(this.allTranslations[this.config.fallbackLanguage]?.[namespace], key);
        if (typeof fallbackValue === 'string') {
          if (this.config.debug) {
            console.log(`[i18n] Fallback: ${language} → ${this.config.fallbackLanguage} for key: ${namespace}.${key}`);
          }
          return fallbackValue;
        }
      }

      // 3차: common 네임스페이스에서 찾기 (다른 네임스페이스인 경우)
      if (namespace !== 'common') {
        const commonValue = this.getNestedValue(this.allTranslations[language]?.['common'], key);
        if (typeof commonValue === 'string') {
          if (this.config.debug) {
            console.log(`[i18n] Common fallback for key: ${namespace}.${key}`);
          }
          return commonValue;
        }
      }

      // 4차: 번역 키를 찾을 수 없는 경우 (string이 아닌 값 포함)
      if (this.config.missingKeyHandler) {
        return this.config.missingKeyHandler(`${namespace}.${key}`, language, namespace);
      }
      return `${namespace}.${key}`;
    } catch (error) {
      if (this.config.debug) {
        console.error('Error finding translation for namespace:', namespace, 'key:', key, error);
      }
      return `${namespace}.${key}`;
    }
  }

  /**
   * 중첩된 객체에서 키 값을 찾기
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    try {
      return path.split('.').reduce((current: unknown, key: string) => {
        return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
      }, obj);
    } catch (error) {
      if (this.config.debug) {
        console.error('Error accessing nested value for path:', path, error);
      }
      return undefined;
    }
  }

  /**
   * 번역 텍스트에서 파라미터 치환
   */
  private interpolate(text: string, params: Record<string, unknown>): string {
    if (!params || typeof text !== 'string') {
      return text;
    }

    try {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = params[key];
        if (value === undefined || value === null) {
          if (this.config.debug) {
            console.warn(`Missing parameter: ${key} in translation: ${text}`);
          }
          return match;
        }
        return String(value);
      });
    } catch (error) {
      if (this.config.debug) {
        console.error('Error interpolating parameters:', error);
      }
      return text;
    }
  }

  /**
   * 파라미터가 있는 번역 함수
   */
  translateWithParams(key: string, params?: Record<string, unknown>, language?: string): string {
    try {
      const translated = this.translate(key, language);
      return params ? this.interpolate(translated, params) : translated;
    } catch (error) {
      if (this.config.debug) {
        console.error('Error in translateWithParams:', error);
      }
      return key;
    }
  }

  /**
   * 언어 변경
   */
  setLanguage(language: string): void {
    if (!language || typeof language !== 'string') {
      if (this.config.debug) {
        console.warn('Invalid language:', language);
      }
      return;
    }

    if (this.currentLang !== language) {
      this.currentLang = language;
      // 새로운 언어의 번역 데이터가 없으면 로드
      if (!this.allTranslations[language]) {
        this.loadLanguageData(language).catch(error => {
          if (this.config.debug) {
            console.error('Error loading language data for:', language, error);
          }
        });
      }
    }
  }

  /**
   * 새로운 언어 데이터 로드
   */
  private async loadLanguageData(language: string): Promise<void> {
    try {
      this.allTranslations[language] = {};
      for (const namespace of this.config.namespaces || []) {
        try {
          const data = await this.safeLoadTranslations(language, namespace);
          this.allTranslations[language][namespace] = data;
          this.setCacheEntry(`${language}:${namespace}`, data);
        } catch (error) {
          const translationError = error as TranslationError;
          
          if (this.config.errorHandler) {
            this.config.errorHandler(translationError, language, namespace);
          }
          
          // 에러 발생 시 빈 객체로 설정
          this.allTranslations[language][namespace] = {};
        }
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to load language data for:', language, error);
      }
      throw error;
    }
  }

  /**
   * 현재 언어 반환
   */
  getCurrentLanguage(): string {
    return this.currentLang;
  }

  /**
   * 지원 언어 목록 반환
   */
  getSupportedLanguages(): string[] {
    return Object.keys(this.allTranslations);
  }

  /**
   * 초기화 상태 확인
   */
  isReady(): boolean {
    return this.isInitialized && !this.initializationError;
  }

  /**
   * 초기화 에러 확인
   */
  getInitializationError(): TranslationError | null {
    return this.initializationError;
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.cache.clear();
    this.loadedNamespaces.clear();
    this.loadingPromises.clear();
    this.cacheStats = { hits: 0, misses: 0 };
  }

  /**
   * 캐시 엔트리 설정
   */
  private setCacheEntry(key: string, data: TranslationNamespace): void {
    const ttl = this.config.cacheOptions?.ttl || 24 * 60 * 60 * 1000; // 기본 24시간
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  private getCacheEntry(key: string): TranslationNamespace | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    // TTL 체크
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheStats.misses++;
      return null;
    }

    this.cacheStats.hits++;
    return entry.data;
  }

  /**
   * 에러 생성 헬퍼
   */
  private createTranslationError(
    code: TranslationError['code'],
    originalError: Error,
    language?: string,
    namespace?: string,
    key?: string
  ): TranslationError {
    return createTranslationError(code, originalError.message, originalError, {
      language,
      namespace,
      key,
      retryCount: 0,
      maxRetries: this.config.errorHandling?.recoveryStrategy?.maxRetries || 3
    });
  }

  /**
   * 에러 로깅
   */
  private logError(error: TranslationError): void {
    const loggingConfig = this.config.errorHandling?.logging || defaultErrorLoggingConfig;
    logTranslationError(error, loggingConfig);
  }

  /**
   * 에러 복구 시도
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    error: TranslationError,
    context: { language?: string; namespace?: string; key?: string }
  ): Promise<T> {
    const recoveryStrategy = this.config.errorHandling?.recoveryStrategy || defaultErrorRecoveryStrategy;
    
    if (!recoveryStrategy.shouldRetry(error)) {
      throw error;
    }

    let lastError = error;
    
    for (let attempt = 1; attempt <= recoveryStrategy.maxRetries; attempt++) {
      try {
        // 지수 백오프 적용
        const delay = recoveryStrategy.retryDelay * Math.pow(recoveryStrategy.backoffMultiplier, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 재시도 콜백 호출
        recoveryStrategy.onRetry(error, attempt);
        
        // 작업 재시도
        return await operation();
      } catch (retryError) {
        lastError = createTranslationError(
          error.code,
          (retryError as Error).message,
          retryError as Error,
          {
            language: context.language,
            namespace: context.namespace,
            key: context.key,
            retryCount: attempt,
            maxRetries: recoveryStrategy.maxRetries
          }
        );
        lastError.retryCount = attempt;
        lastError.maxRetries = recoveryStrategy.maxRetries;
        
        if (attempt === recoveryStrategy.maxRetries) {
          recoveryStrategy.onMaxRetriesExceeded(lastError);
          this.logError(lastError);
          throw lastError;
        }
      }
    }
    
    throw lastError;
  }

  /**
   * 안전한 번역 로딩 (재시도 포함)
   */
  private async safeLoadTranslations(language: string, namespace: string): Promise<TranslationNamespace> {
    const loadOperation = async (): Promise<TranslationNamespace> => {
      const data = await this.config.loadTranslations(language, namespace);
      
      if (!isTranslationNamespace(data)) {
        throw new Error(`Invalid translation data for ${language}:${namespace}`);
      }
      
      return data;
    };

    try {
      return await loadOperation();
    } catch (error) {
      const translationError = this.createTranslationError(
        'LOAD_FAILED',
        error as Error,
        language,
        namespace
      );
      
      // 재시도 가능한 에러인지 확인
      if (isRecoverableError(translationError)) {
        return await this.retryOperation(loadOperation, translationError, { language, namespace });
      }
      
      // 재시도 불가능한 에러는 바로 던지기
      this.logError(translationError);
      throw translationError;
    }
  }

  /**
   * 개발자 도구
   */
  debug() {
    return {
      getCurrentLanguage: () => this.currentLang,
      getSupportedLanguages: () => this.getSupportedLanguages(),
      getLoadedNamespaces: () => Array.from(this.loadedNamespaces),
      getAllTranslations: () => this.allTranslations,
      isReady: () => this.isReady(),
      getInitializationError: () => this.getInitializationError(),
      clearCache: () => this.clearCache(),
      getCacheStats: () => ({
        size: this.cache.size,
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
      }),
    };
  }

  /**
   * SSR에서 하이드레이션을 위한 데이터 설정
   */
  hydrateFromSSR(translations: Record<string, Record<string, TranslationNamespace>>): void {
    this.allTranslations = translations;
    // 캐시도 함께 채움
    for (const language of Object.keys(translations)) {
      for (const namespace of Object.keys(translations[language])) {
        this.setCacheEntry(`${language}:${namespace}`, translations[language][namespace]);
      }
    }
    this.isInitialized = true;
  }

  // 기존 메서드들 (하위 호환성을 위해 유지)
  async translateAsync(key: string, params?: Record<string, unknown>): Promise<string> {
    try {
      const { namespace, key: translationKey } = this.parseKey(key);
      // 현재 언어로 번역 시도
      let translationData = await this.loadTranslationData(this.currentLang, namespace);
      let translation = this.getNestedValue(translationData, translationKey) as string;
      // 현재 언어에서 찾지 못한 경우 폴백 언어로 시도
      if (!translation && this.config.fallbackLanguage && this.currentLang !== this.config.fallbackLanguage) {
        translationData = await this.loadTranslationData(this.config.fallbackLanguage, namespace);
        translation = this.getNestedValue(translationData, translationKey) as string;
      }
      // 번역을 찾지 못한 경우
      if (!translation) {
        if (this.config.missingKeyHandler) {
          return this.config.missingKeyHandler(key, this.currentLang, namespace);
        }
        if (this.config.debug) {
          console.warn(`Translation not found for key: ${key}`);
        }
        return key;
      }
      return params ? this.interpolate(translation, params) : translation;
    } catch (error) {
      if (this.config.debug) {
        console.error('Error in translateAsync:', error);
      }
      return key;
    }
  }

  translateSync(key: string, params?: Record<string, unknown>): string {
    try {
      const { namespace, key: translationKey } = this.parseKey(key);
      // 현재 언어의 캐시된 데이터 확인
      const currentCacheKey = `${this.currentLang}:${namespace}`;
      const cachedData = this.getCacheEntry(currentCacheKey);
      if (cachedData) {
        const translation = this.getNestedValue(cachedData, translationKey) as string;
        if (translation) {
          return params ? this.interpolate(translation, params) : translation;
        }
      }
      // 폴백 언어의 캐시된 데이터 확인
      if (this.config.fallbackLanguage && this.currentLang !== this.config.fallbackLanguage) {
        const fallbackCacheKey = `${this.config.fallbackLanguage}:${namespace}`;
        const fallbackCachedData = this.getCacheEntry(fallbackCacheKey);
        if (fallbackCachedData) {
          const translation = this.getNestedValue(fallbackCachedData, translationKey) as string;
          if (translation) {
            return params ? this.interpolate(translation, params) : translation;
          }
        }
      }
      // 캐시에 없으면 키 반환
      if (this.config.missingKeyHandler) {
        return this.config.missingKeyHandler(key, this.currentLang, namespace);
      }
      return key;
    } catch (error) {
      if (this.config.debug) {
        console.error('Error in translateSync:', error);
      }
      return key;
    }
  }

  private parseKey(key: string): { namespace: string; key: string } {
    const parts = key.split('.');
    if (parts.length === 1) {
      return { namespace: 'common', key: parts[0] };
    }
    return { namespace: parts[0], key: parts.slice(1).join('.') };
  }

  private async loadTranslationData(language: string, namespace: string): Promise<TranslationNamespace> {
    const cacheKey = `${language}:${namespace}`;
    const existingPromise = this.loadingPromises.get(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }
    
    const cachedData = this.getCacheEntry(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const loadingPromise = this._loadTranslationData(language, namespace);
    this.loadingPromises.set(cacheKey, loadingPromise);
    try {
      const result = await loadingPromise;
      this.loadingPromises.delete(cacheKey);
      return result;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  private async _loadTranslationData(language: string, namespace: string): Promise<TranslationNamespace> {
    const cacheKey = `${language}:${namespace}`;
    try {
      const data = await this.safeLoadTranslations(language, namespace);
      
      this.setCacheEntry(cacheKey, data);
      this.loadedNamespaces.add(namespace);
      
      if (this.config.debug) {
        console.log(`Loaded translations for ${language}:${namespace}`, data);
      }
      
      return data;
    } catch (error) {
      const translationError = error as TranslationError;
      
      if (this.config.errorHandler) {
        this.config.errorHandler(translationError, language, namespace);
      }
      
      if (this.config.fallbackLanguage && language !== this.config.fallbackLanguage) {
        try {
          const fallbackData = await this.safeLoadTranslations(this.config.fallbackLanguage, namespace);
          this.setCacheEntry(cacheKey, fallbackData);
          this.loadedNamespaces.add(namespace);
          return fallbackData;
        } catch (fallbackError) {
          const fallbackTranslationError = fallbackError as TranslationError;
          
          if (this.config.errorHandler) {
            this.config.errorHandler(fallbackTranslationError, this.config.fallbackLanguage, namespace);
          }
        }
      }
      return {};
    }
  }
}

/**
 * SSR 전용 번역 함수 (서버에서 동기적으로 번역) - 기존 호환성
 */
export function ssrTranslate({
  translations, 
  key, 
  language = 'ko', 
  fallbackLanguage = 'en', 
  missingKeyHandler = (key: string) => key 
}: {
  translations: Record<string, Record<string, TranslationNamespace>>;
  key: string;
  language?: string;
  fallbackLanguage?: string;
  missingKeyHandler?: (key: string) => string;
}): string {
  if (!key || typeof key !== 'string') {
    return '';
  }
  try {
    // 키를 네임스페이스와 키로 분리
    const parts = key.split('.');
    if (parts.length === 1) {
      // 단일 키인 경우 common 네임스페이스에서 찾기
      return ssrFindInNamespace(translations, 'common', parts[0], language, fallbackLanguage, missingKeyHandler);
    }
    // 첫 번째 부분을 네임스페이스로, 나머지를 키로
    const namespace = parts[0];
    const translationKey = parts.slice(1).join('.');
    return ssrFindInNamespace(translations, namespace, translationKey, language, fallbackLanguage, missingKeyHandler);
  }
  catch (error) {
    console.error('SSR Translation error for key:', key, error);
    return missingKeyHandler(key);
  }
}

/**
 * SSR에서 특정 네임스페이스에서 키 찾기
 */
function ssrFindInNamespace(
  translations: Record<string, Record<string, TranslationNamespace>>, 
  namespace: string, 
  key: string, 
  language: string, 
  fallbackLanguage: string, 
  missingKeyHandler: (key: string) => string
): string {
  try {
    // 1차: 요청된 언어에서 찾기
    const value = getNestedValue(translations[language]?.[namespace], key);
    if (typeof value === 'string') {
      return value;
    }
    // 2차: 폴백 언어에서 찾기 (ko → en → [MISSING] 흐름)
    if (language !== fallbackLanguage) {
      const fallbackValue = getNestedValue(translations[fallbackLanguage]?.[namespace], key);
      if (typeof fallbackValue === 'string') {
        return fallbackValue;
      }
    }
    // 3차: common 네임스페이스에서 찾기 (다른 네임스페이스인 경우)
    if (namespace !== 'common') {
      const commonValue = getNestedValue(translations[language]?.['common'], key);
      if (typeof commonValue === 'string') {
        return commonValue;
      }
    }
    // 4차: 번역 키를 찾을 수 없는 경우
    return missingKeyHandler(`${namespace}.${key}`);
  }
  catch (error) {
    console.error('Error finding SSR translation for namespace:', namespace, 'key:', key, error);
    return missingKeyHandler(`${namespace}.${key}`);
  }
}

/**
 * 통합 서버 번역 함수 (모든 환경 지원) - 추천
 * 
 * 지원 환경:
 * - Next.js (App Router, Pages Router)
 * - React Server Components
 * - CRA (Create React App)
 * - Vite
 * - Webpack
 * - 기타 모든 React 환경
 */
export function serverTranslate({
  translations,
  key,
  language = 'ko',
  fallbackLanguage = 'en',
  missingKeyHandler = (key: string) => key,
  options = {}
}: {
  translations: Record<string, any>; // 번역 데이터
  key: string; // 번역 키
  language?: string; // 언어 코드
  fallbackLanguage?: string; // 폴백 언어
  missingKeyHandler?: (key: string) => string; // 누락 키 처리
  options?: {
    cache?: Map<string, string>; // 캐시 (선택적)
    metrics?: { hits: number; misses: number }; // 메트릭 (선택적)
    debug?: boolean; // 디버그 모드 (선택적)
  };
}): string {
  if (!key || typeof key !== 'string') {
    return '';
  }

  const { cache, metrics, debug } = options;

  // 캐시 사용 시
  if (cache) {
    const cacheKey = `${language}:${key}`;
    if (cache.has(cacheKey)) {
      if (metrics) metrics.hits++;
      if (debug) console.log(`Cache hit: ${cacheKey}`);
      return cache.get(cacheKey)!;
    }
  }

  try {
    // 키를 네임스페이스와 키로 분리
    const parts = key.split('.');
    if (parts.length === 1) {
      // 단일 키인 경우 common 네임스페이스에서 찾기
      const result = findInTranslations(translations, 'common', parts[0], language, fallbackLanguage, missingKeyHandler);
      if (cache) cache.set(`${language}:${key}`, result);
      if (metrics) metrics.misses++;
      return result;
    }
    
    // 첫 번째 부분을 네임스페이스로, 나머지를 키로
    const namespace = parts[0];
    const translationKey = parts.slice(1).join('.');
    const result = findInTranslations(translations, namespace, translationKey, language, fallbackLanguage, missingKeyHandler);
    if (cache) cache.set(`${language}:${key}`, result);
    if (metrics) metrics.misses++;
    return result;
  } catch (error) {
    if (debug) console.error('Server translation error for key:', key, error);
    const fallback = missingKeyHandler(key);
    if (cache) cache.set(`${language}:${key}`, fallback);
    return fallback;
  }
}

/**
 * 번역 데이터에서 키 찾기 (통합 로직)
 */
function findInTranslations(
  translations: Record<string, any>,
  namespace: string,
  key: string,
  language: string,
  fallbackLanguage: string,
  missingKeyHandler: (key: string) => string
): string {
  try {
    // 1차: 요청된 언어에서 찾기
    const value = getNestedValue(translations[language]?.[namespace], key);
    if (typeof value === 'string') {
      return value;
    }
    
    // 2차: 폴백 언어에서 찾기
    if (language !== fallbackLanguage) {
      const fallbackValue = getNestedValue(translations[fallbackLanguage]?.[namespace], key);
      if (typeof fallbackValue === 'string') {
        return fallbackValue;
      }
    }
    
    // 3차: common 네임스페이스에서 찾기
    if (namespace !== 'common') {
      const commonValue = getNestedValue(translations[language]?.['common'], key);
      if (typeof commonValue === 'string') {
        return commonValue;
      }
    }
    
    // 4차: 번역 키를 찾을 수 없는 경우
    return missingKeyHandler(`${namespace}.${key}`);
  } catch (error) {
    console.error('Error finding translation for namespace:', namespace, 'key:', key, error);
    return missingKeyHandler(`${namespace}.${key}`);
  }
}

/**
 * 중첩된 객체에서 키 값을 찾기 (SSR용)
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }
  try {
    return path.split('.').reduce((current: unknown, key: string) => {
      return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
    }, obj);
  }
  catch (error) {
    console.error('Error accessing nested value for path:', path, error);
    return undefined;
  }
}

/**
 * 간단한 서버 번역 함수 (초보자용) - 모든 환경 호환
 * @deprecated serverTranslate() 사용을 권장합니다
 */
export function simpleSsrTranslate(
  key: string,
  language: string = 'ko',
  fallbackLanguage: string = 'en'
): string {
  console.warn('simpleSsrTranslate is deprecated. Use serverTranslate() instead.');
  return serverTranslate({
    translations: {},
    key,
    language,
    fallbackLanguage,
    missingKeyHandler: (key) => key
  });
}

/**
 * 파일 기반 서버 번역 함수 (중급자용) - 모든 환경 호환
 * @deprecated serverTranslate() 사용을 권장합니다
 */
export function fileSsrTranslate(
  key: string,
  language: string = 'ko',
  fallbackLanguage: string = 'en',
  basePath: string = './translations'
): string {
  console.warn('fileSsrTranslate is deprecated. Use serverTranslate() instead.');
  return serverTranslate({
    translations: {},
    key,
    language,
    fallbackLanguage,
    missingKeyHandler: (key) => key
  });
}

/**
 * 고급 서버 번역 함수 (고급자용) - 성능 최적화
 * @deprecated serverTranslate() with options 사용을 권장합니다
 */
export function advancedSsrTranslate({
  translations,
  key,
  language = 'ko',
  fallbackLanguage = 'en',
  missingKeyHandler = (key: string) => key,
  cache = new Map(),
  metrics = { hits: 0, misses: 0 }
}: {
  translations: Record<string, Record<string, TranslationNamespace>>;
  key: string;
  language?: string;
  fallbackLanguage?: string;
  missingKeyHandler?: (key: string) => string;
  cache?: Map<string, string>;
  metrics?: { hits: number; misses: number };
}): string {
  console.warn('advancedSsrTranslate is deprecated. Use serverTranslate() with options instead.');
  return serverTranslate({
    translations,
    key,
    language,
    fallbackLanguage,
    missingKeyHandler,
    options: { cache, metrics, debug: false }
  });
}

/**
 * 동적 네임스페이스 로더 (고급자용) - Next.js 친화적
 * @deprecated serverTranslate() 사용을 권장합니다
 */
export async function dynamicSsrTranslate({
  key,
  language = 'ko',
  fallbackLanguage = 'en',
  namespaceLoader = async (lang: string, ns: string) => {
    console.warn('dynamicSsrTranslate is deprecated. Use serverTranslate() instead.');
    return {};
  },
  cache = new Map()
}: {
  key: string;
  language?: string;
  fallbackLanguage?: string;
  namespaceLoader?: (language: string, namespace: string) => Promise<TranslationNamespace>;
  cache?: Map<string, TranslationNamespace>;
}): Promise<string> {
  console.warn('dynamicSsrTranslate is deprecated. Use serverTranslate() instead.');
  return serverTranslate({
    translations: {},
    key,
    language,
    fallbackLanguage,
    missingKeyHandler: (key) => key
  });
}

/**
 * Next.js 친화적인 서버 번역 함수 (추천)
 * @deprecated serverTranslate() 사용을 권장합니다
 */
export function nextJsSsrTranslate({
  translations,
  key,
  language = 'ko',
  fallbackLanguage = 'en',
  missingKeyHandler = (key: string) => key
}: {
  translations: Record<string, any>;
  key: string;
  language?: string;
  fallbackLanguage?: string;
  missingKeyHandler?: (key: string) => string;
}): string {
  console.warn('nextJsSsrTranslate is deprecated. Use serverTranslate() instead.');
  return serverTranslate({
    translations,
    key,
    language,
    fallbackLanguage,
    missingKeyHandler
  });
}

/**
 * Next.js에서 번역 데이터에서 키 찾기
 */
function nextJsFindInTranslations(
  translations: Record<string, any>,
  namespace: string,
  key: string,
  language: string,
  fallbackLanguage: string,
  missingKeyHandler: (key: string) => string
): string {
  try {
    // 1차: 요청된 언어에서 찾기
    const value = getNestedValue(translations[language]?.[namespace], key);
    if (typeof value === 'string') {
      return value;
    }
    // 2차: 폴백 언어에서 찾기
    if (language !== fallbackLanguage) {
      const fallbackValue = getNestedValue(translations[fallbackLanguage]?.[namespace], key);
      if (typeof fallbackValue === 'string') {
        return fallbackValue;
      }
    }
    // 3차: common 네임스페이스에서 찾기
    if (namespace !== 'common') {
      const commonValue = getNestedValue(translations[language]?.['common'], key);
      if (typeof commonValue === 'string') {
        return commonValue;
      }
    }
    // 4차: 번역 키를 찾을 수 없는 경우
    return missingKeyHandler(`${namespace}.${key}`);
  } catch (error) {
    console.error('Error finding Next.js translation for namespace:', namespace, 'key:', key, error);
    return missingKeyHandler(`${namespace}.${key}`);
  }
}