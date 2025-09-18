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

// 기본 번역 데이터
function getDefaultTranslations(language: string, namespace: string): Record<string, string> {
  const defaultTranslations: Record<string, Record<string, Record<string, string>>> = {
    ko: {
      common: {
        welcome: "환영합니다",
        greeting: "안녕하세요",
        goodbye: "안녕히 가세요",
        loading: "로딩 중...",
        error: "오류가 발생했습니다",
        success: "성공했습니다",
        cancel: "취소",
        confirm: "확인",
        save: "저장",
        delete: "삭제",
        edit: "편집",
        add: "추가",
        search: "검색",
        filter: "필터",
        sort: "정렬",
        refresh: "새로고침",
        back: "뒤로",
        next: "다음",
        previous: "이전",
        home: "홈",
        about: "소개",
        contact: "연락처",
        settings: "설정",
        profile: "프로필",
        logout: "로그아웃",
        login: "로그인",
        register: "회원가입"
      },
      auth: {
        login: "로그인",
        logout: "로그아웃",
        register: "회원가입",
        email: "이메일",
        password: "비밀번호",
        forgot_password: "비밀번호 찾기",
        remember_me: "로그인 상태 유지"
      },
      errors: {
        not_found: "페이지를 찾을 수 없습니다",
        server_error: "서버 오류가 발생했습니다",
        network_error: "네트워크 오류가 발생했습니다",
        unauthorized: "인증이 필요합니다",
        forbidden: "접근이 거부되었습니다"
      }
    },
    en: {
      common: {
        welcome: "Welcome",
        greeting: "Hello",
        goodbye: "Goodbye",
        loading: "Loading...",
        error: "An error occurred",
        success: "Success",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        refresh: "Refresh",
        back: "Back",
        next: "Next",
        previous: "Previous",
        home: "Home",
        about: "About",
        contact: "Contact",
        settings: "Settings",
        profile: "Profile",
        logout: "Logout",
        login: "Login",
        register: "Register"
      },
      auth: {
        login: "Login",
        logout: "Logout",
        register: "Register",
        email: "Email",
        password: "Password",
        forgot_password: "Forgot Password",
        remember_me: "Remember Me"
      },
      errors: {
        not_found: "Page not found",
        server_error: "Server error occurred",
        network_error: "Network error occurred",
        unauthorized: "Authentication required",
        forbidden: "Access denied"
      }
    }
  };

  return defaultTranslations[language]?.[namespace] || {};
}

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

  // config.defaultLanguage가 변경되면 currentLanguage도 업데이트
  useEffect(() => {
    if (config.defaultLanguage !== currentLanguage) {
      setCurrentLanguageState(config.defaultLanguage);
    }
  }, [config.defaultLanguage, currentLanguage]);

  // Translator 인스턴스 초기화 (메모이제이션)
  const translator = useMemo(() => {
    if (!validateI18nConfig(config)) {
      throw new Error('Invalid I18nConfig provided to I18nProvider');
    }
    return TranslatorFactory.create(config);
  }, [config]);

  useEffect(() => {
    console.log('🔄 [USEI18N] useEffect triggered:', { 
      hasTranslator: !!translator, 
      currentLanguage, 
      debug: config.debug,
      isInitialized 
    });
    
    const initializeTranslator = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (config.debug) {
          console.log('🚀 [USEI18N] Starting translator initialization...');
        }
        
        translator.setLanguage(currentLanguage);
        
        // 모든 번역 데이터 미리 로드
        await translator.initialize();
        setIsInitialized(true);
        
        if (config.debug) {
          console.log('✅ [USEI18N] Translator initialization completed successfully');
        }
      } catch (err) {
        const initError = err as TranslationError;
        setError(initError);
        if (config.debug) {
          console.error('❌ [USEI18N] Failed to initialize translator:', initError);
        }
        // 에러가 발생해도 초기화 완료로 표시 (기본 번역 사용)
        setIsInitialized(true);
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
  const setLanguage = useCallback(async (language: string) => {
    if (translator) {
      console.log(`🔄 [USEI18N] Changing language from ${currentLanguage} to ${language}`);
      
      // 언어 변경
      translator.setLanguage(language);
      setCurrentLanguageState(language);
      
      // 새로운 언어의 번역 데이터 로드
      try {
        setIsLoading(true);
        await translator.initialize();
        console.log(`✅ [USEI18N] Successfully loaded translations for ${language}`);
      } catch (error) {
        console.error(`❌ [USEI18N] Failed to load translations for ${language}:`, error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [translator, currentLanguage]);

  // hua-api 스타일의 간단한 번역 함수 (메모이제이션)
  const t = useCallback((key: string, language?: string) => {
    // if (config.debug) {
    //   console.log(`🎯 [USEI18N] t() called:`, { key, language, hasTranslator: !!translator, isInitialized, isLoading });
    // }
    
    if (!translator) {
      // if (config.debug) {
      //   console.warn('🎯 [USEI18N] No translator available');
      // }
      return key;
    }
    
    // 초기화 중이거나 완료되지 않았을 때는 기본 번역 시도
    if (!isInitialized || isLoading) {
      // if (config.debug) {
      //   console.log(`⏳ [USEI18N] Translator not ready, trying basic translation for: ${key}`);
      // }
      
      // 기본 번역 데이터에서 찾기
      const parseKey = (key: string) => {
        const parts = key.split(':');
        if (parts.length >= 2) {
          return { namespace: parts[0], key: parts.slice(1).join(':') };
        }
        return { namespace: 'common', key };
      };
      
      const { namespace, key: actualKey } = parseKey(key);
      const defaultTranslations = getDefaultTranslations(currentLanguage, namespace);
      const fallbackTranslations = getDefaultTranslations(config.fallbackLanguage || 'en', namespace);
      
      const result = defaultTranslations[actualKey] || fallbackTranslations[actualKey] || key;
      
      // if (config.debug) {
      //   console.log(`📝 [USEI18N] Using fallback translation:`, { key, result });
      // }
      
      return result;
    }
    
    // 정상적인 번역 시도
    try {
      const result = translator.translate(key, language);
      // if (config.debug) {
      //   console.log(`✅ [USEI18N] Translation result:`, { key, result });
      // }
      return result;
    } catch (error) {
      // if (config.debug) {
      //   console.warn('❌ [USEI18N] Translation error:', error);
      // }
      return key;
    }
  }, [translator, config.debug, isInitialized, isLoading, currentLanguage, config.fallbackLanguage]);

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
    getCurrentLanguage: () => {
      try {
        return translator?.getCurrentLanguage() || currentLanguage;
      } catch {
        return currentLanguage;
      }
    },
    getSupportedLanguages: () => {
      try {
        return translator?.getSupportedLanguages() || config.supportedLanguages?.map(l => l.code) || [];
      } catch {
        return config.supportedLanguages?.map(l => l.code) || [];
      }
    },
    getLoadedNamespaces: () => {
      try {
        const debugInfo = translator?.debug();
        if (debugInfo && debugInfo.loadedNamespaces) {
          return Array.from(debugInfo.loadedNamespaces);
        }
        // 번역 데이터가 있으면 네임스페이스 추정
        if (debugInfo && debugInfo.allTranslations) {
          const namespaces = new Set<string>();
          Object.values(debugInfo.allTranslations).forEach((langData: any) => {
            Object.keys(langData).forEach(namespace => {
              namespaces.add(namespace);
            });
          });
          return Array.from(namespaces);
        }
        return [];
      } catch (error) {
        return [];
      }
    },
    getAllTranslations: () => {
      try {
        return translator?.debug()?.allTranslations || {};
      } catch (error) {
        return {};
      }
    },
    isReady: () => {
      try {
        return translator?.isReady() || isInitialized;
      } catch {
        return isInitialized;
      }
    },
    getInitializationError: () => {
      try {
        return translator?.getInitializationError() || error;
      } catch {
        return error;
      }
    },
    clearCache: () => {
      try {
        translator?.clearCache();
      } catch {
        // 무시
      }
    },
    getCacheStats: () => {
      try {
        const debugInfo = translator?.debug();
        if (debugInfo && debugInfo.cacheStats) {
          return { 
            size: debugInfo.cacheSize || 0, 
            hits: debugInfo.cacheStats.hits || 0, 
            misses: debugInfo.cacheStats.misses || 0 
          };
        }
        return { size: 0, hits: 0, misses: 0 };
      } catch (error) {
        return { size: 0, hits: 0, misses: 0 };
      }
    },
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
  }), [translator, currentLanguage, error, isInitialized, config.supportedLanguages]);

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
    isInitialized, // 추가: 초기화 상태 직접 노출
  }), [currentLanguage, setLanguage, t, tWithParams, tAsync, tSync, isLoading, error, config.supportedLanguages, debug, isInitialized]);

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
      isInitialized: false,
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