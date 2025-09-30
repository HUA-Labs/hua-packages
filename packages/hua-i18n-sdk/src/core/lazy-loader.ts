import { TranslationNamespace } from '../types';
import { i18nResourceManager } from './i18n-resource';

/**
 * 네임스페이스별 지연 로딩 전략
 * 대규모 앱에서 번역 단위 최적화를 위한 loadOnDemand 함수
 */
export class LazyLoader {
  private static instance: LazyLoader;
  private loadingQueue = new Map<string, Promise<TranslationNamespace>>();
  private preloadCache = new Set<string>();
  private loadHistory = new Map<string, number>();

  private constructor() {}

  static getInstance(): LazyLoader {
    if (!LazyLoader.instance) {
      LazyLoader.instance = new LazyLoader();
    }
    return LazyLoader.instance;
  }

  /**
   * 필요할 때 네임스페이스 로딩
   */
  async loadOnDemand(
    language: string,
    namespace: string,
    loader: (lang: string, ns: string) => Promise<TranslationNamespace>
  ): Promise<TranslationNamespace> {
    const cacheKey = `${language}:${namespace}`;
    
    // 이미 로딩 중이면 기존 Promise 반환
    if (this.loadingQueue.has(cacheKey)) {
      return this.loadingQueue.get(cacheKey)!;
    }

    // 캐시에 있으면 반환
    const cached = i18nResourceManager.getCachedTranslationsSync(language, namespace);
    if (cached) {
      this.updateLoadHistory(cacheKey);
      return cached;
    }

    // 새로 로딩
    const loadPromise = this.performLoad(language, namespace, loader);
    this.loadingQueue.set(cacheKey, loadPromise);

    try {
      const result = await loadPromise;
      this.updateLoadHistory(cacheKey);
      return result;
    } finally {
      this.loadingQueue.delete(cacheKey);
    }
  }

  /**
   * 실제 로딩 수행
   */
  private async performLoad(
    language: string,
    namespace: string,
    loader: (lang: string, ns: string) => Promise<TranslationNamespace>
  ): Promise<TranslationNamespace> {
    console.log(`🔄 Loading namespace: ${namespace} for language: ${language}`);
    
    const startTime = performance.now();
    const result = await i18nResourceManager.getCachedTranslations(language, namespace, loader);
    const endTime = performance.now();
    
    console.log(`✅ Loaded namespace: ${namespace} in ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  }

  /**
   * 로딩 히스토리 업데이트
   */
  private updateLoadHistory(cacheKey: string): void {
    this.loadHistory.set(cacheKey, Date.now());
  }

  /**
   * 네임스페이스 사전 로딩
   */
  async preloadNamespace(
    language: string,
    namespace: string,
    loader: (lang: string, ns: string) => Promise<TranslationNamespace>
  ): Promise<void> {
    const cacheKey = `${language}:${namespace}`;
    
    if (this.preloadCache.has(cacheKey)) {
      return; // 이미 사전 로딩됨
    }

    console.log(`📦 Preloading namespace: ${namespace} for language: ${language}`);
    
    try {
      await this.loadOnDemand(language, namespace, loader);
      this.preloadCache.add(cacheKey);
      console.log(`✅ Preloaded namespace: ${namespace}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload namespace: ${namespace}`, error);
    }
  }

  /**
   * 여러 네임스페이스 동시 사전 로딩
   */
  async preloadMultipleNamespaces(
    language: string,
    namespaces: string[],
    loader: (lang: string, ns: string) => Promise<TranslationNamespace>
  ): Promise<void> {
    console.log(`📦 Preloading ${namespaces.length} namespaces for language: ${language}`);
    
    const promises = namespaces.map(namespace => 
      this.preloadNamespace(language, namespace, loader)
    );
    
    await Promise.allSettled(promises);
    console.log(`✅ Preloading completed for language: ${language}`);
  }

  /**
   * 사용 패턴 기반 자동 사전 로딩
   */
  async autoPreload(
    language: string,
    currentNamespace: string,
    loader: (lang: string, ns: string) => Promise<TranslationNamespace>
  ): Promise<void> {
    // 현재 네임스페이스와 관련된 네임스페이스들 자동 사전 로딩
    const relatedNamespaces = this.getRelatedNamespaces(currentNamespace);
    
    for (const namespace of relatedNamespaces) {
      await this.preloadNamespace(language, namespace, loader);
    }
  }

  /**
   * 관련 네임스페이스 추정
   */
  private getRelatedNamespaces(currentNamespace: string): string[] {
    // 실제 구현에서는 사용 패턴 분석을 통해 관련 네임스페이스 추정
    const namespacePatterns: Record<string, string[]> = {
      'auth': ['common', 'validation', 'errors'],
      'dashboard': ['common', 'navigation', 'stats'],
      'profile': ['common', 'auth', 'validation'],
      'settings': ['common', 'navigation', 'forms'],
      'common': ['errors', 'validation']
    };

    return namespacePatterns[currentNamespace] || [];
  }

  /**
   * 로딩 우선순위 설정
   */
  setLoadPriority(namespaces: string[]): void {
    // 우선순위가 높은 네임스페이스들을 먼저 로딩
    console.log(`🎯 Set load priority: ${namespaces.join(', ')}`);
  }

  /**
   * 로딩 통계 가져오기
   */
  getLoadStats() {
    return {
      loadingQueueSize: this.loadingQueue.size,
      preloadedCount: this.preloadCache.size,
      loadHistorySize: this.loadHistory.size
    };
  }

  /**
   * 메모리 최적화
   */
  optimizeMemory(): void {
    // 오래된 로딩 히스토리 정리
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, timestamp] of this.loadHistory.entries()) {
      if (now - timestamp > oneHour) {
        this.loadHistory.delete(key);
      }
    }

    console.log('🧹 Memory optimization completed');
  }

  /**
   * 네임스페이스 사용 빈도 분석
   */
  analyzeUsagePatterns(): Record<string, number> {
    const usage: Record<string, number> = {};
    
    for (const [key, timestamp] of this.loadHistory.entries()) {
      const namespace = key.split(':')[1];
      usage[namespace] = (usage[namespace] || 0) + 1;
    }
    
    return usage;
  }

  /**
   * 캐시 무효화
   */
  invalidateCache(language?: string, namespace?: string): void {
    i18nResourceManager.invalidateCache(language, namespace);
    
    if (language && namespace) {
      const cacheKey = `${language}:${namespace}`;
      this.preloadCache.delete(cacheKey);
      this.loadHistory.delete(cacheKey);
    } else if (language) {
      // 특정 언어의 모든 캐시 무효화
      for (const key of this.preloadCache) {
        if (key.startsWith(`${language}:`)) {
          this.preloadCache.delete(key);
          this.loadHistory.delete(key);
        }
      }
    } else {
      // 전체 캐시 무효화
      this.preloadCache.clear();
      this.loadHistory.clear();
    }
  }
}

/**
 * 전역 지연 로더 인스턴스
 */
export const lazyLoader = LazyLoader.getInstance();

/**
 * 편의 함수: 필요할 때 로딩
 */
export const loadOnDemand = (
  language: string,
  namespace: string,
  loader: (lang: string, ns: string) => Promise<TranslationNamespace>
) => {
  return lazyLoader.loadOnDemand(language, namespace, loader);
};

/**
 * 편의 함수: 사전 로딩
 */
export const preloadNamespace = (
  language: string,
  namespace: string,
  loader: (lang: string, ns: string) => Promise<TranslationNamespace>
) => {
  return lazyLoader.preloadNamespace(language, namespace, loader);
};

/**
 * 편의 함수: 자동 사전 로딩
 */
export const autoPreload = (
  language: string,
  currentNamespace: string,
  loader: (lang: string, ns: string) => Promise<TranslationNamespace>
) => {
  return lazyLoader.autoPreload(language, currentNamespace, loader);
}; 