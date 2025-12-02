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
  // 번역 로드 완료 시 리렌더링을 위한 상태
  const [translationVersion, setTranslationVersion] = useState(0);

  // config.defaultLanguage가 변경되면 currentLanguage도 업데이트
  // 단, 초기화 전에만 적용 (초기화 후에는 외부에서 언어 변경 가능)
  useEffect(() => {
    if (!isInitialized && config.defaultLanguage !== currentLanguage) {
      setCurrentLanguageState(config.defaultLanguage);
    }
  }, [config.defaultLanguage, currentLanguage, isInitialized]);

  // Translator 인스턴스 초기화 (메모이제이션)
  const translator = useMemo(() => {
    if (!validateI18nConfig(config)) {
      throw new Error('Invalid I18nConfig provided to I18nProvider');
    }
    return TranslatorFactory.create(config);
  }, [config]);

  // 초기화는 한 번만 수행
  useEffect(() => {
    if (isInitialized) {
      // 이미 초기화되어 있으면 언어만 변경
      // 단, translator의 현재 언어와 다를 때만 변경 (무한 루프 방지)
      const translatorLang = translator.getCurrentLanguage();
      if (translatorLang !== currentLanguage) {
        // translator의 언어를 currentLanguage로 변경
        // 이는 외부에서 setLanguage를 호출했을 때 발생하는 정상적인 동기화
        if (config.debug) {
          console.log(`🔄 [USEI18N] Syncing translator language: ${translatorLang} -> ${currentLanguage} (already initialized)`);
        }
        translator.setLanguage(currentLanguage);
      }
      return;
    }
    
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
  }, [translator, currentLanguage, config.debug, isInitialized]);

  // 번역 로드 완료 이벤트 감지 (리렌더링 트리거)
  useEffect(() => {
    if (!translator || !isInitialized) {
      return;
    }

    const unsubscribe = translator.onTranslationLoaded(() => {
      // 번역이 로드되면 상태를 업데이트하여 리렌더링 트리거
      setTranslationVersion(prev => prev + 1);
      if (config.debug) {
        console.log('🔄 [USEI18N] Translation loaded, triggering re-render');
      }
    });

    return unsubscribe;
  }, [translator, isInitialized, config.debug]);

  // Translator의 언어 변경 감지 (외부에서 translator.setLanguage() 호출 시 동기화)
  useEffect(() => {
    if (!translator || !isInitialized) {
      return;
    }

    // 언어 변경 이벤트 구독
    const unsubscribe = translator.onLanguageChanged((newLanguage: string) => {
      if (newLanguage !== currentLanguage) {
        if (config.debug) {
          console.log(`🔄 [USEI18N] Language changed event: ${currentLanguage} -> ${newLanguage}`);
        }
        setCurrentLanguageState(newLanguage);
        setTranslationVersion(prev => prev + 1); // 리렌더링 트리거
      }
    });

    return unsubscribe;
  }, [translator, isInitialized, currentLanguage, config.debug]);

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
    if (!translator) {
      return;
    }

    // 현재 언어와 동일하면 스킵 (무한 루프 방지)
    const currentLang = translator.getCurrentLanguage();
    if (currentLang === language) {
      if (config.debug) {
        console.log(`⏭️ [USEI18N] Language unchanged, skipping: ${language}`);
      }
      return;
    }

    if (config.debug) {
      console.log(`🔄 [USEI18N] setLanguage called: ${currentLang} -> ${language}`);
    }
    
    setIsLoading(true);
    
    try {
      // 언어 변경 (translate 함수에서 이전 언어의 번역을 임시로 반환하므로 깜빡임 방지)
      translator.setLanguage(language);
      setCurrentLanguageState(language);
      
      // 새로운 언어의 번역 데이터가 이미 로드되어 있는지 확인
      // 로드되지 않은 네임스페이스는 자동으로 로드됨 (translator 내부에서 처리)
      // 언어 변경 시 리렌더링 트리거 (번역 로드 완료 이벤트가 자동으로 발생)
      await new Promise(resolve => setTimeout(resolve, 0)); // 다음 틱에서 리렌더링
      
      if (config.debug) {
        console.log(`✅ [USEI18N] Language changed to ${language}`);
      }
    } catch (error) {
      if (config.debug) {
        console.error(`❌ [USEI18N] Failed to change language to ${language}:`, error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [translator, config.debug]);

  // hua-api 스타일의 간단한 번역 함수 (메모이제이션)
  // translationVersion과 currentLanguage에 의존하여 번역 로드 및 언어 변경 시 리렌더링 트리거
  const t = useCallback((key: string, language?: string) => {
    // translationVersion과 currentLanguage를 참조하여 번역 로드 및 언어 변경 시 리렌더링 트리거
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = translationVersion;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const __ = currentLanguage;
    // if (config.debug) {
    //   console.log(`🎯 [USEI18N] t() called:`, { key, language, hasTranslator: !!translator, isInitialized, isLoading });
    // }
    
    if (!translator) {
      // if (config.debug) {
      //   console.warn('🎯 [USEI18N] No translator available');
      // }
      return key;
    }
    
    // 통일된 번역 조회 로직 (초기화 전/후 동일)
    // 1. translator.translate() 시도 (초기화 완료 후 또는 초기화 중에도 시도)
    // 2. 결과가 없으면 SSR 번역 확인
    // 3. 그래도 없으면 기본 번역 확인
    
    const parseKey = (key: string) => {
      const parts = key.split(':');
      if (parts.length >= 2) {
        return { namespace: parts[0], key: parts.slice(1).join(':') };
      }
      return { namespace: 'common', key };
    };
    
    const targetLang = language || currentLanguage;
    
    // 1단계: translator.translate() 시도 (초기화 완료 여부와 관계없이 시도)
    let result: string | undefined;
    try {
      result = translator.translate(key, language);
      
      // 번역 결과가 유효한 경우 반환
      if (result && result !== key && result !== '') {
        return result;
      }
    } catch (error) {
      // translator.translate() 실패 시 다음 단계로
      result = undefined;
    }
    
    // 2단계: SSR 번역 데이터에서 찾기 (언어 변경 중 깜빡임 방지)
    if (config.initialTranslations) {
      const { namespace, key: actualKey } = parseKey(key);
      
      // 현재 언어의 SSR 번역 확인
      const ssrTranslations = config.initialTranslations[targetLang]?.[namespace];
      if (ssrTranslations && ssrTranslations[actualKey]) {
        return ssrTranslations[actualKey];
      }
      
      // 폴백 언어의 SSR 번역 확인
      const fallbackLang = config.fallbackLanguage || 'en';
      if (targetLang !== fallbackLang) {
        const fallbackTranslations = config.initialTranslations[fallbackLang]?.[namespace];
        if (fallbackTranslations && fallbackTranslations[actualKey]) {
          return fallbackTranslations[actualKey];
        }
      }
    }
    
    // 3단계: 기본 번역 데이터에서 찾기
    const { namespace, key: actualKey } = parseKey(key);
    const defaultTranslations = getDefaultTranslations(targetLang, namespace);
    const fallbackTranslations = getDefaultTranslations(config.fallbackLanguage || 'en', namespace);
    
    const defaultResult = defaultTranslations[actualKey] || fallbackTranslations[actualKey];
    if (defaultResult) {
      return defaultResult;
    }
    
    // 모든 단계에서 번역을 찾지 못한 경우
    // 디버그 모드에서는 키를 반환하고, 프로덕션에서는 빈 문자열 반환 (미싱 키 노출 방지)
    if (config.debug) {
      return key; // 개발 환경에서는 키를 표시하여 디버깅 가능
    }
    return ''; // 프로덕션에서는 빈 문자열 반환하여 미싱 키 노출 방지
  }, [translator, config.debug, isInitialized, isLoading, currentLanguage, config.fallbackLanguage, translationVersion, config.initialTranslations]) as (key: string, language?: string) => string;

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

  // 원시 값 가져오기 (배열, 객체 포함)
  const getRawValue = useCallback((key: string, language?: string): unknown => {
    if (!translator || !isInitialized) {
      return undefined;
    }
    return translator.getRawValue(key, language);
  }, [translator, isInitialized]);

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
          Object.values(debugInfo.allTranslations).forEach((langData: unknown) => {
            if (langData && typeof langData === 'object') {
              Object.keys(langData).forEach(namespace => {
                namespaces.add(namespace);
              });
            }
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
    getRawValue,
    isLoading,
    error,
    supportedLanguages: config.supportedLanguages,
    debug,
    isInitialized, // 추가: 초기화 상태 직접 노출
    translationVersion, // 번역 로드 완료 시 리렌더링 트리거
  }), [currentLanguage, setLanguage, t, tWithParams, tAsync, tSync, getRawValue, isLoading, error, config.supportedLanguages, debug, isInitialized, translationVersion]);

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