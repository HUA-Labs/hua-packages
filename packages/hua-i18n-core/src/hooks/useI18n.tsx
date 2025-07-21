"use client";
import { useState, useEffect, useCallback, useContext, createContext, useMemo } from 'react';
import { Translator } from '../core/translator';
import { TranslatorFactory } from '../core/translator-factory';
import { 
  I18nConfig, 
  I18nContextType, 
  TranslationParams, 
  TranslationError,
  validateI18nConfig
} from '../types';

// React Context
const I18nContext = createContext<I18nContextType | null>(null);

/**
 * I18n Provider 컴포넌트
 */
export function I18nProvider({ 
  config, 
  children 
}: { 
  config: I18nConfig & { autoLanguageSync?: boolean }; 
  children: React.ReactNode; 
}) {
  const [currentLanguage, setCurrentLanguageState] = useState(config.defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<TranslationError | null>(null);

  // Translator 인스턴스 초기화 (메모이제이션)
  const translator = useMemo(() => {
    if (!validateI18nConfig(config)) {
      throw new Error('Invalid I18nConfig provided to I18nProvider');
    }
    return TranslatorFactory.create(config);
  }, [config]);

  useEffect(() => {
    const initializeTranslator = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        translator.setLanguage(currentLanguage);
        
        // 모든 번역 데이터 미리 로드
        await translator.initialize();
        setIsInitialized(true);
      } catch (err) {
        const initError = err as TranslationError;
        setError(initError);
        if (config.debug) {
        console.error('Failed to initialize translator:', initError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeTranslator();
  }, [translator, currentLanguage, config.debug]);

  // 자동 언어 전환 이벤트 처리
  useEffect(() => {
    if (!config.autoLanguageSync || typeof window === 'undefined') {
      return;
    }

    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail;
      if (typeof newLanguage === 'string' && newLanguage !== currentLanguage) {
        console.log('🌐 Auto language sync:', newLanguage);
        setLanguage(newLanguage);
      }
    };

    // hua-i18n-sdk 언어 전환 이벤트 감지
    window.addEventListener('huaI18nLanguageChange', handleLanguageChange as EventListener);
    
    // 일반적인 언어 변경 이벤트도 감지
    window.addEventListener('i18nLanguageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('huaI18nLanguageChange', handleLanguageChange as EventListener);
      window.removeEventListener('i18nLanguageChanged', handleLanguageChange as EventListener);
    };
  }, [config.autoLanguageSync, currentLanguage]);

  // 언어 변경 함수 (메모이제이션)
  const setLanguage = useCallback((language: string) => {
    if (translator && language !== currentLanguage) {
      translator.setLanguage(language);
      setCurrentLanguageState(language);
    }
  }, [translator, currentLanguage]);

  // hua-api 스타일의 간단한 번역 함수 (메모이제이션)
  const t = useCallback((key: string, language?: string) => {
    if (!translator || !isInitialized) {
      return key;
    }
    return translator.translate(key, language);
  }, [translator, isInitialized]);

  // 파라미터가 있는 번역 함수 (메모이제이션)
  const tWithParams = useCallback((key: string, params?: TranslationParams, language?: string) => {
    if (!translator || !isInitialized) {
      return key;
    }
    return translator.translateWithParams(key, params, language);
  }, [translator, isInitialized]);

  // 기존 비동기 번역 함수 (하위 호환성)
  const tAsync = useCallback(async (key: string, params?: TranslationParams) => {
    if (!translator) {
      if (config.debug) {
      console.warn('Translator not initialized');
      }
      return key;
    }

    setIsLoading(true);
    try {
      const result = await translator.translateAsync(key, params);
      return result;
    } catch (error) {
      if (config.debug) {
      console.error('Translation error:', error);
      }
      return key;
    } finally {
      setIsLoading(false);
    }
  }, [translator, config.debug]);

  // 기존 동기 번역 함수 (하위 호환성)
  const tSync = useCallback((key: string, namespace?: string, params?: TranslationParams) => {
    if (!translator) {
      if (config.debug) {
      console.warn('Translator not initialized');
      }
      return key;
    }

    return translator.translateSync(key, params);
  }, [translator, config.debug]);

  // 개발자 도구 (메모이제이션)
  const debug = useMemo(() => ({
    getCurrentLanguage: () => translator?.getCurrentLanguage() || currentLanguage,
    getSupportedLanguages: () => translator?.getSupportedLanguages() || [],
    getLoadedNamespaces: () => translator?.debug().getLoadedNamespaces() || [],
    getAllTranslations: () => translator?.debug().getAllTranslations() || {},
    isReady: () => translator?.isReady() || false,
    getInitializationError: () => translator?.getInitializationError() || error,
    clearCache: () => translator?.clearCache(),
    getCacheStats: () => translator?.debug().getCacheStats() || { size: 0, hits: 0, misses: 0 },
    reloadTranslations: async () => {
      if (translator) {
        setIsLoading(true);
        setError(null);
        try {
          await translator.initialize();
        } catch (err) {
          setError(err as TranslationError);
        } finally {
          setIsLoading(false);
        }
      }
    },
  }), [translator, currentLanguage, error]);

  const value: I18nContextType = useMemo(() => ({
    currentLanguage,
    setLanguage,
    t,
    tWithParams,
    tAsync,
    tSync,
    isLoading,
    error,
    supportedLanguages: config.supportedLanguages,
    debug,
  }), [currentLanguage, setLanguage, t, tWithParams, tAsync, tSync, isLoading, error, config.supportedLanguages, debug]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * I18n 훅
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Provider 밖에서 호출되면 기본값 반환
    return {
      currentLanguage: 'ko',
      setLanguage: () => {},
      t: (key: string) => key,
      tWithParams: (key: string) => key,
      tAsync: async (key: string) => key,
      tSync: (key: string) => key,
      isLoading: false,
      error: null,
      supportedLanguages: [
        { code: 'ko', name: 'Korean', nativeName: '한국어' },
        { code: 'en', name: 'English', nativeName: 'English' },
      ],
      debug: {
        getCurrentLanguage: () => 'ko',
        getSupportedLanguages: () => ['ko', 'en'],
        getLoadedNamespaces: () => [],
        getAllTranslations: () => ({}),
        isReady: () => false,
        getInitializationError: () => null,
        clearCache: () => {},
        getCacheStats: () => ({ size: 0, hits: 0, misses: 0 }),
        reloadTranslations: async () => {},
      },
    };
  }
  return context;
}

/**
 * 간단한 번역 훅 (hua-api 스타일)
 */
export function useTranslation() {
  const { t, tWithParams, currentLanguage, setLanguage, isLoading, error, supportedLanguages } = useI18n();
  
  return {
    t,
    tWithParams,
    currentLanguage,
    setLanguage,
    isLoading,
    error,
    supportedLanguages,
  };
}

/**
 * 언어 변경 훅
 */
export function useLanguageChange() {
  const context = useContext(I18nContext);
  
  // Provider 밖에서 호출되면 기본값 반환
  if (!context) {
    return {
      currentLanguage: 'ko',
      changeLanguage: () => {},
      supportedLanguages: [
        { code: 'ko', name: 'Korean', nativeName: '한국어' },
        { code: 'en', name: 'English', nativeName: 'English' },
      ],
    };
  }
  
  const { currentLanguage, setLanguage, supportedLanguages } = context;
  
  const changeLanguage = useCallback((language: string) => {
    const supported = supportedLanguages.find(lang => lang.code === language);
    if (supported) {
      setLanguage(language);
    } else {
      console.warn(`Language ${language} is not supported`);
    }
  }, [setLanguage, supportedLanguages]);

  return {
    currentLanguage,
    changeLanguage,
    supportedLanguages,
  };
}

// 기존 훅들 (하위 호환성을 위해 유지)
export function usePreloadTranslations() {
  const context = useContext(I18nContext);
  
  const preload = useCallback(async (namespaces: string[]) => {
    if (!context) return;
    
    // 이미 초기화되어 있으므로 별도 로딩 불필요
    console.warn('usePreloadTranslations is deprecated. Translations are now preloaded automatically.');
  }, [context]);

  return { preload };
}

export function useAutoLoadNamespace(namespace: string) {
  // 이미 초기화되어 있으므로 별도 로딩 불필요
  console.warn('useAutoLoadNamespace is deprecated. All namespaces are now loaded automatically.');
} 