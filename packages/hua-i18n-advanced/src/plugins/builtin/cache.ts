/**
 * 캐시 플러그인 - 번역 결과 캐싱
 */

import { Plugin, PluginFactory } from '../types';

export interface CacheEntry {
  value: string;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enableCompression: boolean;
  enablePersistence: boolean;
}

export function cachePlugin(config?: Partial<CacheConfig>): Plugin {
  const defaultConfig: CacheConfig = {
    maxSize: 1000,
    defaultTTL: 5 * 60 * 1000, // 5분
    enableCompression: false,
    enablePersistence: true
  };

  const finalConfig = { ...defaultConfig, ...config };
  const cache = new Map<string, CacheEntry>();
  const stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  // 로컬 스토리지에서 캐시 로드
  if (typeof window !== 'undefined' && finalConfig.enablePersistence) {
    try {
      const stored = localStorage.getItem('i18n-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, entry]: [string, any]) => {
          // TTL 체크
          if (Date.now() - entry.timestamp < entry.ttl) {
            cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  // 캐시 저장 함수
  const saveCache = () => {
    if (typeof window !== 'undefined' && finalConfig.enablePersistence) {
      try {
        const cacheData: Record<string, CacheEntry> = {};
        cache.forEach((entry, key) => {
          cacheData[key] = entry;
        });
        localStorage.setItem('i18n-cache', JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to save cache to localStorage:', error);
      }
    }
  };

  // 캐시 크기 관리
  const manageCacheSize = () => {
    if (cache.size > finalConfig.maxSize) {
      // LRU 방식으로 오래된 항목 제거
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, cache.size - finalConfig.maxSize);
      toRemove.forEach(([key]) => {
        cache.delete(key);
        stats.evictions++;
      });
    }
  };

  // TTL 체크 및 정리
  const cleanupExpired = () => {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      cache.delete(key);
    });
  };

  return {
    name: 'cache',
    version: '1.0.0',
    description: 'Caches translation results for better performance',
    hooks: {
      beforeTranslate: (context) => {
        const { key, language, namespace } = context;
        const cacheKey = `${language}:${namespace}:${key}`;
        
        // TTL 체크 및 정리
        cleanupExpired();
        
        // 캐시에서 찾기
        const entry = cache.get(cacheKey);
        if (entry) {
          entry.hits++;
          stats.hits++;
          
          // 캐시된 결과를 context에 설정
          (context as any).cachedResult = entry.value;
          (context as any).fromCache = true;
        } else {
          stats.misses++;
        }
      },

      afterTranslate: (context) => {
        const { key, language, namespace, result } = context;
        const cacheKey = `${language}:${namespace}:${key}`;
        
        // 캐시에서 온 결과가 아니면 캐시에 저장
        if (!(context as any).fromCache && result) {
          const entry: CacheEntry = {
            value: result,
            timestamp: Date.now(),
            ttl: finalConfig.defaultTTL,
            hits: 0
          };
          
          cache.set(cacheKey, entry);
          manageCacheSize();
          saveCache();
        }
      },

      onLanguageChange: () => {
        // 언어 변경 시 캐시 정리 (선택적)
        // 필요에 따라 특정 언어의 캐시만 정리할 수 있음
        cleanupExpired();
        saveCache();
      },

      onInitialize: () => {
        // 초기화 시 캐시 정리
        cleanupExpired();
        console.log(`Cache plugin initialized with ${cache.size} entries`);
      },

      onDestroy: () => {
        // 정리 시 캐시 저장
        saveCache();
        console.log(`Cache plugin destroyed. Stats: ${JSON.stringify(stats)}`);
      }
    },
    priority: 10, // 높은 우선순위로 캐시를 먼저 확인
    enabled: true,
    config: finalConfig
  };
}

// 캐시 유틸리티 함수들
export function getCacheStats(): { size: number; hits: number; misses: number; evictions: number; hitRate: number } {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('i18n-cache-stats');
      if (stored) {
        const stats = JSON.parse(stored);
        const total = stats.hits + stats.misses;
        return {
          ...stats,
          hitRate: total > 0 ? stats.hits / total : 0
        };
      }
    } catch (error) {
      console.warn('Failed to load cache stats:', error);
    }
  }
  
  return {
    size: 0,
    hits: 0,
    misses: 0,
    evictions: 0,
    hitRate: 0
  };
}

export function clearCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('i18n-cache');
    localStorage.removeItem('i18n-cache-stats');
  }
}

export function getCacheSize(): number {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('i18n-cache');
      if (stored) {
        const cache = JSON.parse(stored);
        return Object.keys(cache).length;
      }
    } catch (error) {
      console.warn('Failed to get cache size:', error);
    }
  }
  
  return 0;
}

export function getCacheKeys(): string[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('i18n-cache');
      if (stored) {
        const cache = JSON.parse(stored);
        return Object.keys(cache);
      }
    } catch (error) {
      console.warn('Failed to get cache keys:', error);
    }
  }
  
  return [];
} 