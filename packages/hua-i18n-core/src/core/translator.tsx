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
  debug(): unknown;
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
      if (this.config.debug) {
        console.log('🚫 [TRANSLATOR] Already initialized, skipping');
      }
      return;
    }

    if (this.config.debug) {
      console.log('🚀 [TRANSLATOR] Starting initialization...');
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
        console.log('🌍 [TRANSLATOR] Initializing translator with languages:', languages);
        console.log('📍 [TRANSLATOR] Current language:', this.currentLang);
        console.log('📦 [TRANSLATOR] Config namespaces:', this.config.namespaces);
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
            this.loadedNamespaces.add(`${language}:${namespace}`);
            
          } catch (error) {
            const translationError = this.createTranslationError(
              'LOAD_FAILED',
              error as Error,
              language,
              namespace
            );
            
            this.logError(translationError);
            
            // 폴백 언어로 시도
            if (language !== this.config.fallbackLanguage) {
              try {
                const fallbackData = await this.safeLoadTranslations(this.config.fallbackLanguage || 'en', namespace);
                this.allTranslations[language][namespace] = fallbackData;
                this.loadedNamespaces.add(`${language}:${namespace}`);
                
                if (this.config.debug) {
                  console.log('Using fallback data for', language, namespace);
                }
              } catch (fallbackError) {
                const fallbackTranslationError = this.createTranslationError(
                  'FALLBACK_LOAD_FAILED',
                  fallbackError as Error,
                  this.config.fallbackLanguage,
                  namespace
                );
                
                this.logError(fallbackTranslationError);
                
                // 기본 번역 데이터 사용
                this.allTranslations[language][namespace] = {};
              }
            } else {
              // 기본 번역 데이터 사용
              this.allTranslations[language][namespace] = {};
            }
          }
        }
      }
      
      this.isInitialized = true;
      
      if (this.config.debug) {
        console.log('Translator initialized successfully');
        console.log('Loaded translations:', this.allTranslations);
      }
      
    } catch (error) {
      this.initializationError = this.createTranslationError(
        'INITIALIZATION_FAILED',
        error as Error
      );
      
      this.logError(this.initializationError);
      
      // 에러가 발생해도 초기화 완료로 표시 (기본 번역 사용)
      this.isInitialized = true;
      
      if (this.config.debug) {
        console.warn('Translator initialized with errors, using fallback translations');
      }
    }
  }

  /**
   * 번역 키를 번역된 텍스트로 변환
   */
  translate(key: string, language?: string): string {
    const targetLang = language || this.currentLang;
    
    // if (this.config.debug) {
    //   console.log(`🔍 [TRANSLATOR] translate called:`, {
    //     key,
    //     targetLang,
    //     isInitialized: this.isInitialized,
    //     allTranslations: this.allTranslations,
    //     currentLang: this.currentLang
    //   });
    // }
    
    if (!this.isInitialized) {
      if (this.config.debug) {
        console.warn('Translator not initialized. Call initialize() first.');
      }
      // 초기화되지 않았을 때도 기본 번역 시도
      const { namespace, key: actualKey } = this.parseKey(key);
      const translations = this.allTranslations[targetLang]?.[namespace];
      
      if (this.config.debug) {
        console.log(`🔍 [TRANSLATOR] Not initialized, trying fallback:`, {
          namespace,
          actualKey,
          translations,
          hasTranslation: translations && translations[actualKey]
        });
      }
      
      if (translations && translations[actualKey]) {
        const value = translations[actualKey];
        if (typeof value === 'string') {
          if (this.config.debug) {
            console.log(`✅ [TRANSLATOR] Found fallback translation:`, value);
          }
          return value;
        }
      }
      return this.config.missingKeyHandler?.(key, targetLang, 'default') || key;
    }

    // 네임스페이스:키 형식 파싱
    const { namespace, key: actualKey } = this.parseKey(key);
    
    // 현재 언어에서 찾기
    let result = this.findInNamespace(namespace, actualKey, targetLang);
    
    if (result) {
      this.cacheStats.hits++;
      return result;
    }
    
    // 폴백 언어에서 찾기
    if (targetLang !== this.config.fallbackLanguage) {
      result = this.findInNamespace(namespace, actualKey, this.config.fallbackLanguage || 'en');
      if (result) {
        this.cacheStats.hits++;
        return result;
      }
    }
    
    this.cacheStats.misses++;
    return this.config.missingKeyHandler?.(key, targetLang, namespace) || key;
  }

  /**
   * 네임스페이스에서 키 찾기
   */
  private findInNamespace(namespace: string, key: string, language: string): string {
    const translations = this.allTranslations[language]?.[namespace];
    
    if (!translations) {
      return '';
    }
    
    // 직접 키 매칭
    const directValue = translations[key];
    if (typeof directValue === 'string') {
      return directValue;
    }
    
    // 중첩 키 매칭 (예: "user.profile.name")
    const nestedValue = this.getNestedValue(translations, key);
    if (typeof nestedValue === 'string') {
      return nestedValue;
    }
    
    return '';
  }

  /**
   * 중첩된 객체에서 값을 가져오기
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return undefined;
    }
    
    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * 매개변수 보간
   */
  private interpolate(text: string, params: Record<string, unknown>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * 매개변수가 있는 번역
   */
  translateWithParams(key: string, params?: Record<string, unknown>, language?: string): string {
    const translated = this.translate(key, language);
    
    if (!params) {
      return translated;
    }
    
    return this.interpolate(translated, params);
  }

  /**
   * 언어 설정
   */
  setLanguage(language: string): void {
    if (this.currentLang === language) {
      return;
    }
    
    this.currentLang = language;
    
    // 새로운 언어의 데이터가 로드되지 않았다면 로드
    if (!this.allTranslations[language]) {
      this.loadLanguageData(language).catch(error => {
        if (this.config.debug) {
          console.warn('Failed to load language data:', error);
        }
      });
    }
    
    if (this.config.debug) {
      console.log('Language changed to:', language);
    }
  }

  /**
   * 언어 데이터 로드
   */
  private async loadLanguageData(language: string): Promise<void> {
    if (!this.allTranslations[language]) {
      this.allTranslations[language] = {};
    }
    
    for (const namespace of this.config.namespaces || []) {
      try {
        const data = await this.safeLoadTranslations(language, namespace);
        this.allTranslations[language][namespace] = data;
        this.loadedNamespaces.add(`${language}:${namespace}`);
      } catch (error) {
        if (this.config.debug) {
          console.warn(`Failed to load ${language}:${namespace}:`, error);
        }
        this.allTranslations[language][namespace] = {};
      }
    }
  }

  /**
   * 현재 언어 가져오기
   */
  getCurrentLanguage(): string {
    return this.currentLang;
  }

  /**
   * 지원되는 언어 목록 가져오기
   */
  getSupportedLanguages(): string[] {
    return this.config.supportedLanguages?.map(lang => lang.code) || [];
  }

  /**
   * 초기화 완료 여부 확인
   */
  isReady(): boolean {
    return this.isInitialized && !this.initializationError;
  }

  /**
   * 초기화 오류 가져오기
   */
  getInitializationError(): TranslationError | null {
    return this.initializationError;
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheStats = { hits: 0, misses: 0 };
    
    if (this.config.debug) {
      console.log('Cache cleared');
    }
  }

  /**
   * 캐시 엔트리 설정
   */
  private setCacheEntry(key: string, data: TranslationNamespace): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000 // 5분
    });
  }

  /**
   * 캐시 엔트리 가져오기
   */
  private getCacheEntry(key: string): TranslationNamespace | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // TTL 체크
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * 번역 오류 생성
   */
  private createTranslationError(
    code: TranslationError['code'],
    originalError: Error,
    language?: string,
    namespace?: string,
    key?: string
  ): TranslationError {
    return {
      name: 'TranslationError',
      code,
      message: originalError.message,
      originalError,
      language,
      namespace,
      key,
      timestamp: Date.now(),
      stack: originalError.stack
    };
  }

  /**
   * 오류 로깅
   */
  private logError(error: TranslationError): void {
    if (this.config.errorHandler) {
      this.config.errorHandler(error, error.language || '', error.namespace || '');
    }
  }

  /**
   * 재시도 작업
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    error: TranslationError,
    context: { language?: string; namespace?: string; key?: string }
  ): Promise<T> {
    const maxRetries = 3;
    let lastError = error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (retryError) {
        lastError = this.createTranslationError(
          'RETRY_FAILED',
          retryError as Error,
          context.language,
          context.namespace,
          context.key
        );
        
        if (attempt === maxRetries) {
          break;
        }
        
        // 지수 백오프
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError;
  }

  /**
   * 안전한 번역 로드
   */
  private async safeLoadTranslations(language: string, namespace: string): Promise<TranslationNamespace> {
    if (this.config.debug) {
      console.log(`📥 [TRANSLATOR] safeLoadTranslations called:`, { language, namespace });
    }
    
    const loadOperation = async (): Promise<TranslationNamespace> => {
      if (!this.config.loadTranslations) {
        throw new Error('No translation loader configured');
      }
      
      if (this.config.debug) {
        console.log(`🔄 [TRANSLATOR] Calling loadTranslations for:`, { language, namespace });
      }
      
      const data = await this.config.loadTranslations(language, namespace);
      
      if (this.config.debug) {
        console.log(`📦 [TRANSLATOR] loadTranslations returned:`, data);
      }
      
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
      
      return this.retryOperation(loadOperation, translationError, { language, namespace });
    }
  }

  /**
   * 디버그 정보
   */
  debug() {
    return {
      isInitialized: this.isInitialized,
      currentLanguage: this.currentLang,
      loadedNamespaces: Array.from(this.loadedNamespaces),
      cacheStats: this.cacheStats,
      cacheSize: this.cache.size,
      allTranslations: this.allTranslations,
      initializationError: this.initializationError,
      config: this.config
    };
  }

  /**
   * SSR에서 하이드레이션
   */
  hydrateFromSSR(translations: Record<string, Record<string, TranslationNamespace>>): void {
    this.allTranslations = translations;
    this.isInitialized = true;
    
    // 로드된 네임스페이스 업데이트
    for (const [language, namespaces] of Object.entries(translations)) {
      for (const namespace of Object.keys(namespaces)) {
        this.loadedNamespaces.add(`${language}:${namespace}`);
      }
    }
  }

  /**
   * 비동기 번역 (고급 기능)
   */
  async translateAsync(key: string, params?: Record<string, unknown>): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const translated = this.translate(key);
    
    if (!params) {
      return translated;
    }
    
    return this.interpolate(translated, params);
  }

  /**
   * 동기 번역 (고급 기능)
   */
  translateSync(key: string, params?: Record<string, unknown>): string {
    if (!this.isInitialized) {
      if (this.config.debug) {
        console.warn('Translator not initialized for sync translation');
      }
      const { namespace } = this.parseKey(key);
      return this.config.missingKeyHandler?.(key, this.currentLang, namespace) || key;
    }
    
    const translated = this.translate(key);
    
    if (!params) {
      return translated;
    }
    
    return this.interpolate(translated, params);
  }

  /**
   * 키 파싱 (네임스페이스:키 또는 네임스페이스.키 형식 지원)
   * 우선순위: : > . (첫 번째 구분자 사용)
   */
  private parseKey(key: string): { namespace: string; key: string } {
    // : 구분자 우선 확인
    const colonIndex = key.indexOf(':');
    if (colonIndex !== -1) {
      return { namespace: key.substring(0, colonIndex), key: key.substring(colonIndex + 1) };
    }
    
    // . 구분자 확인 (첫 번째 점만 네임스페이스 구분자로 사용)
    const dotIndex = key.indexOf('.');
    if (dotIndex !== -1) {
      return { namespace: key.substring(0, dotIndex), key: key.substring(dotIndex + 1) };
    }
    
    // 구분자가 없으면 common 네임스페이스로 간주
    return { namespace: 'common', key };
  }

  /**
   * 번역 데이터 로드 (고급 기능)
   */
  private async loadTranslationData(language: string, namespace: string): Promise<TranslationNamespace> {
    const cacheKey = `${language}:${namespace}`;
    
    // 캐시에서 확인
    const cached = this.getCacheEntry(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 로딩 중인지 확인
    const loadingPromise = this.loadingPromises.get(cacheKey);
    if (loadingPromise) {
      return loadingPromise;
    }
    
    // 새로 로드
    const loadPromise = this._loadTranslationData(language, namespace);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const data = await loadPromise;
      this.setCacheEntry(cacheKey, data);
      return data;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * 실제 번역 데이터 로드
   */
  private async _loadTranslationData(language: string, namespace: string): Promise<TranslationNamespace> {
    if (!this.config.loadTranslations) {
      throw new Error('No translation loader configured');
    }
    
    try {
      const data = await this.config.loadTranslations(language, namespace);
      
      if (!isTranslationNamespace(data)) {
        throw new Error(`Invalid translation data for ${language}:${namespace}`);
      }
      
      return data;
    } catch (error) {
      const translationError = this.createTranslationError(
        'LOAD_FAILED',
        error as Error,
        language,
        namespace
      );
      
      this.logError(translationError);
      
      // 기본 번역 데이터 반환
      return {};
    }
  }
}

// SSR 번역 함수들
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
  const { namespace, key: actualKey } = parseKey(key);
  
  // 현재 언어에서 찾기
  let result = ssrFindInNamespace(translations, namespace, actualKey, language, fallbackLanguage, missingKeyHandler);
  
  if (result) {
    return result;
  }
  
  // 폴백 언어에서 찾기
  if (language !== fallbackLanguage) {
    result = ssrFindInNamespace(translations, namespace, actualKey, fallbackLanguage, fallbackLanguage, missingKeyHandler);
    if (result) {
      return result;
    }
  }
  
  return missingKeyHandler(key);
}

function ssrFindInNamespace(
  translations: Record<string, Record<string, TranslationNamespace>>, 
  namespace: string, 
  key: string, 
  language: string, 
  fallbackLanguage: string, 
  missingKeyHandler: (key: string) => string
): string {
  const namespaceData = translations[language]?.[namespace];
  
  if (!namespaceData) {
    return '';
  }
  
  // 직접 키 매칭
  const directValue = namespaceData[key];
  if (typeof directValue === 'string') {
    return directValue;
  }
  
  // 중첩 키 매칭
  const nestedValue = getNestedValue(namespaceData, key);
  if (typeof nestedValue === 'string') {
    return nestedValue;
  }
  
  return '';
}

function getNestedValue(obj: unknown, path: string): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return undefined;
  }
  
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function parseKey(key: string): { namespace: string; key: string } {
  // : 구분자 우선 확인
  const colonIndex = key.indexOf(':');
  if (colonIndex !== -1) {
    return { namespace: key.substring(0, colonIndex), key: key.substring(colonIndex + 1) };
  }
  
  // . 구분자 확인 (첫 번째 점만 네임스페이스 구분자로 사용)
  const dotIndex = key.indexOf('.');
  if (dotIndex !== -1) {
    return { namespace: key.substring(0, dotIndex), key: key.substring(dotIndex + 1) };
  }
  
  // 구분자가 없으면 common 네임스페이스로 간주
  return { namespace: 'common', key };
}

// 서버 번역 함수 (고급 기능 포함)
export function serverTranslate({
  translations,
  key,
  language = 'ko',
  fallbackLanguage = 'en',
  missingKeyHandler = (key: string) => key,
  options = {}
}: {
  translations: Record<string, unknown>; // 번역 데이터
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
  const { cache, metrics, debug } = options;
  
  // 캐시에서 확인
  if (cache) {
    const cacheKey = `${language}:${key}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      if (metrics) metrics.hits++;
      if (debug) console.log(`[CACHE HIT] ${cacheKey}`);
      return cached;
    }
  }
  
  // 번역 찾기
  const result = findInTranslations(translations, key, language, fallbackLanguage, missingKeyHandler);
  
  // 캐시에 저장
  if (cache && result) {
    const cacheKey = `${language}:${key}`;
    cache.set(cacheKey, result);
  }
  
  if (metrics) metrics.misses++;
  if (debug) console.log(`[TRANSLATE] ${key} -> ${result}`);
  
  return result;
}

function findInTranslations(
  translations: Record<string, unknown>,
  key: string,
  language: string,
  fallbackLanguage: string,
  missingKeyHandler: (key: string) => string
): string {
  const { namespace, key: actualKey } = parseKey(key);
  
  // 현재 언어에서 찾기
  let result = findInNamespace(translations, namespace, actualKey, language);
  
  if (result) {
    return result;
  }
  
  // 폴백 언어에서 찾기
  if (language !== fallbackLanguage) {
    result = findInNamespace(translations, namespace, actualKey, fallbackLanguage);
    if (result) {
      return result;
    }
  }
  
  return missingKeyHandler(key);
}

function findInNamespace(
  translations: Record<string, unknown>,
  namespace: string,
  key: string,
  language: string
): string {
  const namespaceData = translations[language]?.[namespace];
  
  if (!namespaceData) {
    return '';
  }
  
  // 직접 키 매칭
  if (namespaceData[key]) {
    return namespaceData[key];
  }
  
  // 중첩 키 매칭
  const nestedValue = getNestedValue(namespaceData, key);
  if (typeof nestedValue === 'string') {
    return nestedValue;
  }
  
  return '';
}