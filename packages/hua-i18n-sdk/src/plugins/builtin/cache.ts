/**
 * 캐시 플러그인 - 번역 데이터 캐싱
 * 성능 향상을 위한 번역 데이터 캐싱 기능
 */

import { Plugin, PluginFactory, PluginContext } from '../types';
import { TranslationData } from '../../types';

export interface CachePluginOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  strategy?: 'lru' | 'fifo' | 'lfu';
  persist?: boolean;
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  keyPrefix?: string;
}

interface CacheEntry {
  data: TranslationData;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export const cachePlugin: PluginFactory<CachePluginOptions> = (options = {}) => {
  const {
    maxSize = 100,
    ttl = 300000, // 5분
    strategy = 'lru',
    persist = false,
    storage = 'memory',
    keyPrefix = 'i18n_cache_'
  } = options;

  const cache = new Map<string, CacheEntry>();
  const storageKey = `${keyPrefix}translations`;

  // 로컬 스토리지에서 캐시 복원
  const restoreFromStorage = () => {
    if (!persist || storage === 'memory') return;

    try {
      const stored = window[storage]?.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, entry]: [string, any]) => {
          if (Date.now() - entry.timestamp < ttl) {
            cache.set(key, entry as CacheEntry);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to restore cache from storage:', error);
    }
  };

  // 로컬 스토리지에 캐시 저장
  const saveToStorage = () => {
    if (!persist || storage === 'memory') return;

    try {
      const serialized = Object.fromEntries(cache.entries());
      window[storage]?.setItem(storageKey, JSON.stringify(serialized));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  };

  // 캐시 키 생성
  const createCacheKey = (language: string, namespace: string): string => {
    return `${language}:${namespace}`;
  };

  // 캐시 정리 (TTL 기반)
  const cleanupExpired = () => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > ttl) {
        cache.delete(key);
      }
    }
  };

  // 캐시 크기 관리
  const manageSize = () => {
    if (cache.size <= maxSize) return;

    cleanupExpired();

    if (cache.size <= maxSize) return;

    const entries = Array.from(cache.entries());
    
    switch (strategy) {
      case 'lru':
        // Least Recently Used
        entries.sort(([,a], [,b]) => a.lastAccessed - b.lastAccessed);
        break;
      case 'lfu':
        // Least Frequently Used
        entries.sort(([,a], [,b]) => a.accessCount - b.accessCount);
        break;
      case 'fifo':
        // First In First Out
        entries.sort(([,a], [,b]) => a.timestamp - b.timestamp);
        break;
    }

    const toRemove = entries.slice(0, cache.size - maxSize);
    toRemove.forEach(([key]) => cache.delete(key));
  };

  // 캐시 조회
  const getFromCache = (language: string, namespace: string): TranslationData | null => {
    const key = createCacheKey(language, namespace);
    const entry = cache.get(key);

    if (!entry) return null;

    // TTL 확인
    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(key);
      return null;
    }

    // 접근 정보 업데이트
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  };

  // 캐시 저장
  const setToCache = (language: string, namespace: string, data: TranslationData) => {
    const key = createCacheKey(language, namespace);
    const now = Date.now();

    cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    });

    manageSize();
    
    if (persist) {
      saveToStorage();
    }
  };

  const plugin: Plugin = {
    id: 'cache',
    name: 'cache',
    version: '1.0.0',
    hooks: {
      beforeLoad: async (context) => {
        // 캐시에서 먼저 확인
        const cached = getFromCache(context.language, context.namespace);
        if (cached) {
          // 캐시 히트 - 로드 중단
          (context as any).value = cached;
          return;
        }
      },

      afterLoad: async (context) => {
        if (context.data) {
          // 캐시에 저장
          setToCache(context.language, context.namespace, context.data);
        }
      },

      onInit: () => {
        if (persist) {
          restoreFromStorage();
        }
        console.log(`Cache plugin initialized with ${strategy} strategy, maxSize: ${maxSize}, TTL: ${ttl}ms`);
      },

      onDestroy: () => {
        if (persist) {
          saveToStorage();
        }
        cache.clear();
      }
    },
    options: {
      getCacheStats: () => ({
        size: cache.size,
        maxSize,
        hitRate: 0, // TODO: 구현
        strategy,
        ttl,
        persist
      }),
      clearCache: () => {
        cache.clear();
        if (persist && storage !== 'memory') {
          window[storage]?.removeItem(storageKey);
        }
      },
      getCacheKeys: () => Array.from(cache.keys()),
      getCacheEntry: (language: string, namespace: string) => {
        const key = createCacheKey(language, namespace);
        return cache.get(key);
      }
    }
  };

  return plugin;
}; 