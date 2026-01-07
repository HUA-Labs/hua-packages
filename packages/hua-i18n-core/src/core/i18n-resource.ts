import { TranslationNamespace, TranslationData } from '../types';

/**
 * i18n 리소스 관리자
 * SSR 환경에서 동일 번역 요청 중복 방지 및 전역 캐시 관리
 */
export class I18nResourceManager {
  private static instance: I18nResourceManager;
  private globalCache = new Map<string, TranslationNamespace>();
  private loadingPromises = new Map<string, Promise<TranslationNamespace>>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    size: 0
  };

  private constructor() {}

  static getInstance(): I18nResourceManager {
    if (!I18nResourceManager.instance) {
      I18nResourceManager.instance = new I18nResourceManager();
    }
    return I18nResourceManager.instance;
  }

  /**
   * 전역 캐시에서 번역 데이터 가져오기
   */
  async getCachedTranslations(
    language: string, 
    namespace: string, 
    loader: (lang: string, ns: string) => Promise<TranslationNamespace>
  ): Promise<TranslationNamespace> {
    const cacheKey = `${language}:${namespace}`;
    
    // 캐시에 있으면 반환
    if (this.globalCache.has(cacheKey)) {
      this.cacheStats.hits++;
      return this.globalCache.get(cacheKey)!;
    }

    // 이미 로딩 중이면 기존 Promise 반환
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // 새로 로딩
    this.cacheStats.misses++;
    const loadPromise = loader(language, namespace).then(data => {
      this.globalCache.set(cacheKey, data);
      this.cacheStats.size = this.globalCache.size;
      this.loadingPromises.delete(cacheKey);
      return data;
    });

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  /**
   * 캐시된 번역 데이터 직접 접근
   */
  getCachedTranslationsSync(language: string, namespace: string): TranslationNamespace | null {
    const cacheKey = `${language}:${namespace}`;
    return this.globalCache.get(cacheKey) || null;
  }

  /**
   * 특정 언어의 모든 네임스페이스 가져오기
   */
  getAllTranslationsForLanguage(language: string): Record<string, TranslationNamespace> {
    const result: Record<string, TranslationNamespace> = {};
    
    for (const [key, data] of this.globalCache.entries()) {
      if (key.startsWith(`${language}:`)) {
        const namespace = key.split(':')[1];
        result[namespace] = data;
      }
    }
    
    return result;
  }

  /**
   * 모든 캐시된 번역 데이터 가져오기
   */
  getAllCachedTranslations(): Record<string, Record<string, TranslationNamespace>> {
    const result: Record<string, Record<string, TranslationNamespace>> = {};
    
    for (const [key, data] of this.globalCache.entries()) {
      const [language, namespace] = key.split(':');
      if (!result[language]) {
        result[language] = {};
      }
      result[language][namespace] = data;
    }
    
    return result;
  }

  /**
   * 캐시 통계 가져오기
   */
  getCacheStats() {
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)
    };
  }

  /**
   * 캐시 무효화
   */
  invalidateCache(language?: string, namespace?: string): void {
    if (language && namespace) {
      // 특정 언어/네임스페이스만 무효화
      const cacheKey = `${language}:${namespace}`;
      this.globalCache.delete(cacheKey);
      this.loadingPromises.delete(cacheKey);
    } else if (language) {
      // 특정 언어의 모든 네임스페이스 무효화
      for (const key of this.globalCache.keys()) {
        if (key.startsWith(`${language}:`)) {
          this.globalCache.delete(key);
          this.loadingPromises.delete(key);
        }
      }
    } else {
      // 전체 캐시 무효화
      this.globalCache.clear();
      this.loadingPromises.clear();
    }
    
    this.cacheStats.size = this.globalCache.size;
  }

  /**
   * 캐시 크기 제한 설정
   */
  setCacheLimit(maxSize: number): void {
    if (this.globalCache.size > maxSize) {
      // LRU 방식으로 오래된 항목 제거
      const entries = Array.from(this.globalCache.entries());
      const toRemove = entries.slice(0, this.globalCache.size - maxSize);
      
      for (const [key] of toRemove) {
        this.globalCache.delete(key);
      }
      
      this.cacheStats.size = this.globalCache.size;
    }
  }

  /**
   * SSR 환경에서 하이드레이션
   */
  hydrateFromSSR(translations: Record<string, Record<string, TranslationNamespace>>): void {
    for (const [language, namespaces] of Object.entries(translations)) {
      for (const [namespace, data] of Object.entries(namespaces)) {
        const cacheKey = `${language}:${namespace}`;
        this.globalCache.set(cacheKey, data);
      }
    }
    
    this.cacheStats.size = this.globalCache.size;
  }

  /**
   * 메모리 사용량 최적화
   */
  optimizeMemory(): void {
    // 사용되지 않는 번역 데이터 정리
    // 실제 구현에서는 사용 통계를 기반으로 정리
  }
}

/**
 * 전역 리소스 매니저 인스턴스
 */
export const i18nResourceManager = I18nResourceManager.getInstance(); 