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
  isRecoverableError,
  isPluralValue,
  PluralCategory
} from '../types';

export interface TranslatorInterface {
  translate(key: string, paramsOrLang?: Record<string, unknown> | string, language?: string): string;
  tPlural(key: string, count: number, params?: Record<string, unknown>, language?: string): string;
  setLanguage(lang: string): void;
  getCurrentLanguage(): string;
  initialize(): Promise<void>;
  isReady(): boolean;
  debug(): unknown;
  getRawValue<T = unknown>(key: string, language?: string): T | undefined;
  tArray(key: string, language?: string): string[];
}

export class Translator implements TranslatorInterface {
  private cache = new Map<string, CacheEntry>();
  private pluralRulesCache = new Map<string, Intl.PluralRules>();
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
  // 번역 로드 완료 시 React 리렌더링을 위한 콜백
  private onTranslationLoadedCallbacks: Set<() => void> = new Set();
  // 언어 변경 시 React 리렌더링을 위한 콜백
  private onLanguageChangedCallbacks: Set<(language: string) => void> = new Set();
  // 디바운싱을 위한 타이머
  private notifyTimer: ReturnType<typeof setTimeout> | null = null;
  // 최근 알림한 네임스페이스 (중복 알림 방지)
  private recentlyNotified = new Set<string>();
  
  /**
   * 번역 로드 완료 콜백 등록
   */
  onTranslationLoaded(callback: () => void): () => void {
    this.onTranslationLoadedCallbacks.add(callback);
    return () => {
      this.onTranslationLoadedCallbacks.delete(callback);
    };
  }

  /**
   * 언어 변경 콜백 등록
   */
  onLanguageChanged(callback: (language: string) => void): () => void {
    this.onLanguageChangedCallbacks.add(callback);
    return () => {
      this.onLanguageChangedCallbacks.delete(callback);
    };
  }

  /**
   * 언어 변경 이벤트 발생
   */
  private notifyLanguageChanged(language: string): void {
    this.onLanguageChangedCallbacks.forEach(callback => {
      try {
        callback(language);
      } catch (error) {
        if (this.config.debug) {
          console.error('Error in language changed callback:', error);
        }
      }
    });
  }
  
  /**
   * 번역 로드 완료 이벤트 발생 (디바운싱 적용)
   */
  private notifyTranslationLoaded(language: string, namespace: string): void {
    const cacheKey = `${language}:${namespace}`;
    
    // 최근에 알림한 네임스페이스는 스킵 (중복 알림 방지)
    if (this.recentlyNotified.has(cacheKey)) {
      return;
    }
    
    this.recentlyNotified.add(cacheKey);
    
    // 디바운싱: 짧은 시간 내 여러 번역이 로드되면 한 번만 알림
    if (this.notifyTimer) {
      clearTimeout(this.notifyTimer);
    }
    
    this.notifyTimer = setTimeout(() => {
      this.onTranslationLoadedCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          if (this.config.debug) {
            console.warn('Error in translation loaded callback:', error);
          }
        }
      });
      
      // 100ms 후 recentlyNotified 초기화 (같은 네임스페이스도 다시 알림 가능하도록)
      setTimeout(() => {
        this.recentlyNotified.clear();
      }, 100);
      
      this.notifyTimer = null;
    }, 50); // 50ms 디바운싱
  }

  constructor(config: I18nConfig) {
    if (!validateI18nConfig(config)) {
      throw new Error('Invalid I18nConfig provided');
    }

    this.config = {
      fallbackLanguage: 'en',
      namespaces: ['common'],
      debug: false,
      missingKeyHandler: (key: string) => key,
      errorHandler: (error: Error) => {
        // Silent by default, user can override
      },
      ...config
    };
    this.currentLang = config.defaultLanguage;
    
    // SSR에서 전달된 초기 번역 데이터가 있으면 즉시 설정 (네트워크 요청 없음)
    if (config.initialTranslations) {
      this.allTranslations = config.initialTranslations;
      // 로드된 네임스페이스 마킹
      for (const [language, namespaces] of Object.entries(config.initialTranslations)) {
        for (const namespace of Object.keys(namespaces)) {
          this.loadedNamespaces.add(`${language}:${namespace}`);
        }
      }
      // initialTranslations가 있으면 초기화 완료로 간주 (SSR에서 이미 로드됨)
      // 이렇게 하면 초기화 전 상태에서도 번역을 사용할 수 있음
      this.isInitialized = true;
    }
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
      
      // 초기 번역 데이터가 이미 있으면 해당 네임스페이스는 스킵
      const skipNamespaces = new Set<string>();
      for (const language of languages) {
        if (this.allTranslations[language]) {
          for (const namespace of Object.keys(this.allTranslations[language])) {
            skipNamespaces.add(`${language}:${namespace}`);
          }
        }
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
          const cacheKey = `${language}:${namespace}`;
          
          // 이미 초기 번역 데이터가 있으면 스킵 (네트워크 요청 없음)
          if (skipNamespaces.has(cacheKey)) {
            if (this.config.debug) {
              console.log('⏭️ [TRANSLATOR] Skipping', namespace, 'for', language, '(already loaded from SSR)');
            }
            continue;
          }
          
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

            // 복구 가능한 에러인지 확인
            if (isRecoverableError(translationError)) {
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
            } else {
              // 복구 불가능한 에러는 기본 번역 데이터 사용
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
   * 초기화되지 않은 상태에서 번역 시도
   */
  private translateBeforeInitialized(key: string, targetLang: string): string {
    if (this.config.debug) {
      console.warn('Translator not initialized. Call initialize() first.');
    }
    
    // 초기화되지 않았을 때도 기본 번역 시도 (initialTranslations 사용)
    const { namespace, key: actualKey } = this.parseKey(key);
    
    // findInNamespace를 사용하여 중첩 키도 처리
    const result = this.findInNamespace(namespace, actualKey, targetLang);
    if (result) {
      if (this.config.debug) {
        console.log(`✅ [TRANSLATOR] Found fallback translation from initialTranslations:`, result);
      }
      return result;
    }
    
    if (this.config.debug) {
      const translations = this.allTranslations[targetLang]?.[namespace];
      console.log(`🔍 [TRANSLATOR] Not initialized, fallback failed:`, {
        namespace,
        actualKey,
        hasTranslations: !!translations,
        translationsKeys: translations ? Object.keys(translations) : []
      });
    }
    return this.config.missingKeyHandler?.(key, targetLang, 'default') || key;
  }

  /**
   * 다른 로드된 언어에서 번역 찾기 (언어 변경 중 깜빡임 방지)
   */
  private findInOtherLanguages(namespace: string, key: string, targetLang: string): string | null {
    if (!this.allTranslations || Object.keys(this.allTranslations).length === 0) {
      return null;
    }

    const loadedLanguages = Object.keys(this.allTranslations);
    for (const lang of loadedLanguages) {
      if (lang !== targetLang) {
        const result = this.findInNamespace(namespace, key, lang);
        if (result) {
          return result;
        }
      }
    }
    
    return null;
  }

  /**
   * 폴백 언어에서 번역 찾기
   */
  private findInFallbackLanguage(namespace: string, key: string, targetLang: string): string | null {
    const fallbackLang = this.config.fallbackLanguage || 'en';
    if (targetLang === fallbackLang) {
      return null;
    }

    const result = this.findInNamespace(namespace, key, fallbackLang);
    if (result) {
      this.cacheStats.hits++;
      return result;
    }
    
    return null;
  }

  /**
   * 번역 키를 번역된 텍스트로 변환
   */
  translate(key: string, paramsOrLang?: Record<string, unknown> | string, language?: string): string {
    // 두 번째 인자 타입으로 분기
    let params: Record<string, unknown> | undefined;
    let targetLang: string;
    if (typeof paramsOrLang === 'string') {
      targetLang = paramsOrLang;
    } else if (typeof paramsOrLang === 'object' && paramsOrLang !== null) {
      params = paramsOrLang;
      targetLang = language || this.currentLang;
    } else {
      targetLang = this.currentLang;
    }

    // 초기화되지 않은 경우 처리
    if (!this.isInitialized) {
      const raw = this.translateBeforeInitialized(key, targetLang);
      return params ? this.interpolate(raw, params) : raw;
    }

    const { namespace, key: actualKey } = this.parseKey(key);

    // 1단계: 현재 언어에서 찾기
    let result: string | null = this.findInNamespace(namespace, actualKey, targetLang);
    if (result) {
      this.cacheStats.hits++;
      return params ? this.interpolate(result, params) : result;
    }

    // 2단계: 다른 로드된 언어에서 찾기 (언어 변경 중 깜빡임 방지)
    result = this.findInOtherLanguages(namespace, actualKey, targetLang);
    if (result) {
      return params ? this.interpolate(result, params) : result;
    }

    // 3단계: 폴백 언어에서 찾기
    result = this.findInFallbackLanguage(namespace, actualKey, targetLang);
    if (result) {
      return params ? this.interpolate(result, params) : result;
    }

    // 모든 단계에서 찾지 못한 경우
    this.cacheStats.misses++;

    if (this.config.debug) {
      const missing = this.config.missingKeyHandler?.(key, targetLang, namespace) || key;
      return params ? this.interpolate(missing, params) : missing;
    }

    // 프로덕션에서는 빈 문자열 반환 (미싱 키 노출 방지)
    return '';
  }

  /**
   * 네임스페이스에서 키 찾기
   */
  private findInNamespace(namespace: string, key: string, language: string): string {
    const translations = this.allTranslations[language]?.[namespace];

    if (!translations) {
      // 네임스페이스가 없으면 자동으로 로드 시도 (비동기, 백그라운드)
      const cacheKey = `${language}:${namespace}`;
      if (!this.loadedNamespaces.has(cacheKey) && !this.loadingPromises.has(cacheKey)) {
        // 로딩 시작 (비동기, 즉시 반환하지 않음)
        this.loadTranslationData(language, namespace).catch(error => {
          if (this.config.debug) {
            console.warn(`⚠️ [TRANSLATOR] Auto-load failed for ${language}/${namespace}:`, error);
          }
        });
        
        // 디버그 모드에서만 첫 시도 시에만 경고 출력 (중복 방지)
        if (this.config.debug) {
          console.warn(`❌ [TRANSLATOR] No translations found for ${language}/${namespace}, attempting auto-load...`);
        }
      }
      return '';
    }

    // 직접 키 매칭
    const directValue = translations[key];
    if (this.isStringValue(directValue)) {
      return directValue;
    }
    if (this.isStringArray(directValue)) {
      return directValue[Math.floor(Math.random() * directValue.length)];
    }

    // 중첩 키 매칭 (예: "user.profile.name")
    const nestedValue = this.getNestedValue(translations, key);
    if (this.isStringValue(nestedValue)) {
      return nestedValue;
    }
    if (this.isStringArray(nestedValue)) {
      return nestedValue[Math.floor(Math.random() * nestedValue.length)];
    }

    if (this.config.debug) {
      console.warn(`❌ [TRANSLATOR] No match found for key: ${key} in ${language}/${namespace}`);
    }
    return '';
  }

  /**
   * 중첩된 객체에서 값을 가져오기
   * 배열도 지원: 최종 값이 string[]이면 그대로 반환
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return undefined;
    }

    return path.split('.').reduce((current: unknown, key: string) => {
      if (current == null) return undefined;
      if (Array.isArray(current)) {
        const idx = Number(key);
        return Number.isInteger(idx) ? current[idx] : undefined;
      }
      if (typeof current === 'object' && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }
  
  /**
   * 문자열 값인지 확인하는 타입 가드
   */
  private isStringValue(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
  }

  /**
   * string[] 배열인지 확인하는 타입 가드
   * 배열 값이 t()에 전달되면 랜덤으로 하나를 선택하여 반환
   */
  private isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.length > 0 && value.every(v => typeof v === 'string');
  }

  /**
   * 원시 값 가져오기 (배열, 객체 포함)
   */
  getRawValue<T = unknown>(key: string, language?: string): T | undefined {
    const targetLang = language || this.currentLang;

    if (!this.isInitialized) {
      if (this.config.debug) {
        console.warn('Translator not initialized. Call initialize() first.');
      }
      return undefined;
    }

    const { namespace, key: actualKey } = this.parseKey(key);
    const translations = this.allTranslations[targetLang]?.[namespace];

    if (!translations) {
      return undefined;
    }

    // 직접 키 매칭
    if (actualKey in translations) {
      return translations[actualKey] as T;
    }

    // 중첩 키 매칭
    const nestedValue = this.getNestedValue(translations, actualKey);
    if (nestedValue !== undefined) {
      return nestedValue as T;
    }

    // 폴백 언어에서 찾기
    if (targetLang !== this.config.fallbackLanguage) {
      const fallbackTranslations = this.allTranslations[this.config.fallbackLanguage || 'en']?.[namespace];
      if (fallbackTranslations) {
        if (actualKey in fallbackTranslations) {
          return fallbackTranslations[actualKey] as T;
        }
        const fallbackNestedValue = this.getNestedValue(fallbackTranslations, actualKey);
        if (fallbackNestedValue !== undefined) {
          return fallbackNestedValue as T;
        }
      }
    }

    return undefined;
  }

  /**
   * 배열 번역 값 가져오기 (타입 안전)
   */
  tArray(key: string, language?: string): string[] {
    const raw = this.getRawValue(key, language);
    if (Array.isArray(raw) && raw.every((v: unknown) => typeof v === 'string')) {
      return raw as string[];
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn(`tArray: "${key}" is not a string array`);
    }
    return [];
  }

  /**
   * Intl.PluralRules 인스턴스 (언어별 캐시)
   */
  private getPluralRules(language: string): Intl.PluralRules {
    let rules = this.pluralRulesCache.get(language);
    if (!rules) {
      rules = new Intl.PluralRules(language);
      this.pluralRulesCache.set(language, rules);
    }
    return rules;
  }

  /**
   * 복수형 번역 (ICU / Intl.PluralRules 기반)
   *
   * JSON: { "other": "총 {count}개" }  (ko)
   *       { "one": "{count} item", "other": "{count} items" }  (en)
   *
   * tPlural('common:total_count', 1) → en: "1 item" / ko: "총 1개"
   * tPlural('common:total_count', 5) → en: "5 items" / ko: "총 5개"
   */
  tPlural(key: string, count: number, params?: Record<string, unknown>, language?: string): string {
    const targetLang = language || this.currentLang;
    const raw = this.getRawValue(key, targetLang);
    const mergedParams: Record<string, unknown> = { count, ...params };

    // PluralValue 객체인 경우: Intl.PluralRules로 카테고리 결정
    if (isPluralValue(raw)) {
      const category = this.getPluralRules(targetLang).select(count) as PluralCategory;
      const text = raw[category] ?? raw.other;
      return this.interpolate(text, mergedParams);
    }

    // fallback: plain string이면 interpolate만
    if (typeof raw === 'string') {
      return this.interpolate(raw, mergedParams);
    }

    // 키를 찾지 못한 경우
    if (this.config.debug) {
      return this.interpolate(key, mergedParams);
    }
    return '';
  }

  /**
   * 매개변수 보간
   *
   * 지원 형식:
   * - {key} - 단일 중괄호 (일반적인 i18n 형식)
   * - {{key}} - 이중 중괄호 (하위 호환성)
   */
  private interpolate(text: string, params: Record<string, unknown>): string {
    // 단일 중괄호 {key} 또는 이중 중괄호 {{key}} 모두 지원
    return text.replace(/\{\{?(\w+)\}?\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * 언어 설정
   */
  setLanguage(language: string): void {
    if (this.currentLang === language) {
      return;
    }

    const previousLanguage = this.currentLang;
    this.currentLang = language;

    // 언어 변경 이벤트 발생
    this.notifyLanguageChanged(language);

    // 새로운 언어의 데이터가 로드되지 않았다면 로드
    if (!this.allTranslations[language]) {
      this.loadLanguageData(language).catch(error => {
        if (this.config.debug) {
          console.warn('Failed to load language data:', error);
        }
      });
    }

    if (this.config.debug) {
      console.log(`🌐 [TRANSLATOR] Language changed: ${previousLanguage} -> ${language}`);
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
        
        // 언어 변경 시 번역 로드 완료 알림
        this.notifyTranslationLoaded(language, namespace);
      } catch (error) {
        const translationError = this.createTranslationError(
          'LOAD_FAILED',
          error as Error,
          language,
          namespace
        );

        this.logError(translationError);

        // 복구 가능한 에러인지 확인
        if (isRecoverableError(translationError)) {
          // 재시도는 safeLoadTranslations 내부에서 처리되므로 여기서는 기본값 사용
          this.allTranslations[language][namespace] = {};
        } else {
          // 복구 불가능한 에러는 기본 번역 데이터 사용
          this.allTranslations[language][namespace] = {};
        }
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
   * 키 파싱 (네임스페이스:키 형식)
   * 
   * - 콜론(:)만 네임스페이스 구분자로 사용
   * - 점(.)은 키 이름의 일부로 취급 (중첩 객체 접근용)
   * 
   * @example
   * parseKey("home:hero.badge") → { namespace: "home", key: "hero.badge" }
   * parseKey("hero.badge") → { namespace: "common", key: "hero.badge" }
   * parseKey("save") → { namespace: "common", key: "save" }
   */
  private parseKey(key: string): { namespace: string; key: string } {
    // 콜론(:)만 네임스페이스 구분자로 사용
    const colonIndex = key.indexOf(':');
    if (colonIndex !== -1) {
      return { namespace: key.substring(0, colonIndex), key: key.substring(colonIndex + 1) };
    }

    // 콜론이 없으면 common 네임스페이스로 간주
    // 점(.)은 키 이름의 일부 (중첩 객체 접근은 getNestedValue에서 처리)
    return { namespace: 'common', key };
  }

  /**
   * 번역 데이터 로드 (고급 기능)
   */
  private async loadTranslationData(language: string, namespace: string): Promise<TranslationNamespace> {
    const cacheKey = `${language}:${namespace}`;

    // 이미 로드된 네임스페이스인지 확인
    if (this.loadedNamespaces.has(cacheKey)) {
      const existing = this.allTranslations[language]?.[namespace];
      if (existing) {
        return existing;
      }
    }

    // 캐시에서 확인
    const cached = this.getCacheEntry(cacheKey);
    if (cached) {
      // 캐시에 있으면 allTranslations에도 저장
      if (!this.allTranslations[language]) {
        this.allTranslations[language] = {};
      }
      this.allTranslations[language][namespace] = cached;
      this.loadedNamespaces.add(cacheKey);
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
      
      // allTranslations에 저장 (중요: 이렇게 해야 findInNamespace에서 찾을 수 있음)
      if (!this.allTranslations[language]) {
        this.allTranslations[language] = {};
      }
      this.allTranslations[language][namespace] = data;
      this.loadedNamespaces.add(cacheKey);
      
      // 캐시에도 저장
      this.setCacheEntry(cacheKey, data);
      
      if (this.config.debug) {
        console.log(`✅ [TRANSLATOR] Auto-loaded and saved ${language}/${namespace}`);
      }
      
      // React 리렌더링 트리거 (디바운싱 적용)
      this.notifyTranslationLoaded(language, namespace);
      
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
  if (isStringValue(directValue)) {
    return directValue;
  }

  // 중첩 키 매칭
  const nestedValue = getNestedValue(namespaceData, key);
  if (isStringValue(nestedValue)) {
    return nestedValue;
  }

  return '';
}

function getNestedValue(obj: unknown, path: string): unknown {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return undefined;
  }

  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && !Array.isArray(current) && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * 문자열 값인지 확인하는 타입 가드
 */
function isStringValue(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * 키 파싱 (네임스페이스:키 형식) - SSR용 standalone 함수
 * 
 * - 콜론(:)만 네임스페이스 구분자로 사용
 * - 점(.)은 키 이름의 일부로 취급 (중첩 객체 접근용)
 */
function parseKey(key: string): { namespace: string; key: string } {
  // 콜론(:)만 네임스페이스 구분자로 사용
  const colonIndex = key.indexOf(':');
  if (colonIndex !== -1) {
    return { namespace: key.substring(0, colonIndex), key: key.substring(colonIndex + 1) };
  }

  // 콜론이 없으면 common 네임스페이스로 간주
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

  return '';
}

function findInNamespace(
  translations: Record<string, unknown>,
  namespace: string,
  key: string,
  language: string
): string {
  // 언어 데이터 가져오기
  const languageData = translations[language];

  // 언어 데이터가 객체인지 확인
  if (!languageData || typeof languageData !== 'object' || Array.isArray(languageData)) {
    return '';
  }

  // 네임스페이스 데이터 가져오기
  const namespaceData = (languageData as Record<string, unknown>)[namespace];

  if (!namespaceData || typeof namespaceData !== 'object' || Array.isArray(namespaceData)) {
    return '';
  }

  // 타입 단언: namespaceData는 객체임을 확인했으므로 Record로 단언
  const data = namespaceData as Record<string, unknown>;

  // 직접 키 매칭
  if (data[key] && typeof data[key] === 'string') {
    return data[key] as string;
  }

  // 중첩 키 매칭
  const nestedValue = getNestedValue(namespaceData, key);
  if (typeof nestedValue === 'string') {
    return nestedValue;
  }

  return '';
}