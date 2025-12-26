/**
 * @hua-labs/i18n-core-zustand - Zustand 어댑터
 * 
 * Zustand 상태관리와 i18n-core를 타입 안전하게 통합하는 어댑터입니다.
 * 
 * @example
 * ```tsx
 * import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
 * import { useAppStore } from './store/useAppStore';
 * 
 * // Zustand 스토어에 language와 setLanguage가 있어야 함
 * const I18nProvider = createZustandI18n(useAppStore, {
 *   fallbackLanguage: 'en',
 *   namespaces: ['common', 'navigation']
 * });
 * 
 * export default function Layout({ children }) {
 *   return <I18nProvider>{children}</I18nProvider>;
 * }
 * ```
 */

import React from 'react';
import { createCoreI18n, useTranslation } from '@hua-labs/i18n-core';
import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * Zustand 스토어에서 언어 관련 상태를 가져오는 인터페이스
 */
export interface ZustandLanguageStore {
  language: string | 'ko' | 'en';
  setLanguage: (lang: string | 'ko' | 'en') => void;
}

/**
 * Zustand 스토어 어댑터 인터페이스
 */
export interface ZustandI18nAdapter {
  getLanguage: () => string;
  setLanguage: (lang: string) => void;
  subscribe: (callback: (lang: string) => void) => () => void;
}

/**
 * Zustand 스토어에서 어댑터 생성
 */
function createZustandAdapter(
  store: UseBoundStore<StoreApi<ZustandLanguageStore>>
): ZustandI18nAdapter {
  return {
    getLanguage: () => store.getState().language,
    setLanguage: (lang: string) => {
      const currentLang = store.getState().language;
      if (currentLang !== lang) {
        store.getState().setLanguage(lang);
      }
    },
    subscribe: (callback: (lang: string) => void) => {
      // Zustand의 subscribe를 사용하여 언어 변경 감지
      let prevLanguage = store.getState().language;
      
      return store.subscribe((state) => {
        const currentLanguage = state.language;
        if (currentLanguage !== prevLanguage) {
          prevLanguage = currentLanguage;
          callback(currentLanguage);
        }
      });
    }
  };
}

/**
 * Zustand 스토어와 i18n-core를 통합하는 Provider 생성
 * 
 * @param store - Zustand 스토어 (language와 setLanguage 메서드 필요)
 * @param config - i18n 설정 (defaultLanguage는 스토어에서 가져옴)
 * @returns I18nProvider 컴포넌트
 * 
 * @example
 * ```tsx
 * import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
 * import { useAppStore } from './store/useAppStore';
 * 
 * const I18nProvider = createZustandI18n(useAppStore, {
 *   fallbackLanguage: 'en',
 *   namespaces: ['common', 'navigation', 'footer'],
 *   translationLoader: 'api',
 *   debug: process.env.NODE_ENV === 'development'
 * });
 * 
 * export default function RootLayout({ children }) {
 *   return <I18nProvider>{children}</I18nProvider>;
 * }
 * ```
 */
export interface ZustandI18nConfig {
  defaultLanguage?: string; // SSR과 일치시키기 위한 초기 언어 (하이드레이션 에러 방지)
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  loadTranslations?: (language: string, namespace: string) => Promise<Record<string, string>>;
  translationLoader?: 'api' | 'static' | 'custom';
  translationApiPath?: string;
  initialTranslations?: Record<string, Record<string, Record<string, string>>>;
  autoLanguageSync?: boolean;
}

export function createZustandI18n(
  store: UseBoundStore<StoreApi<ZustandLanguageStore>>,
  config?: ZustandI18nConfig
): React.ComponentType<{ children: React.ReactNode }> {
  const adapter = createZustandAdapter(store);
  
  // 하이드레이션 에러 방지: SSR과 동일한 초기 언어 사용
  // config에 defaultLanguage가 있으면 사용, 없으면 'ko' (SSR 기본값과 일치)
  // 하이드레이션 완료 후 저장된 언어로 자동 동기화됨
  const initialLanguage = config?.defaultLanguage || 'ko';
  const storeLanguage = adapter.getLanguage();

  // createCoreI18n으로 기본 Provider 생성
  const BaseI18nProvider = createCoreI18n({
    ...config,
    defaultLanguage: initialLanguage, // SSR과 동일한 초기 언어 사용
    // Zustand 어댑터가 직접 언어 동기화 처리하므로 autoLanguageSync 비활성화
    autoLanguageSync: false
  });

  // 언어 동기화 래퍼 컴포넌트 (Provider 내부에서만 사용)
  // BaseI18nProvider가 I18nProvider를 렌더링하므로, 그 자식으로 들어가면 useTranslation 사용 가능
  function LanguageSyncWrapper({ children: innerChildren }: { children: React.ReactNode }) {
    // useTranslation은 I18nProvider 내부에서만 사용 가능
    // BaseI18nProvider가 I18nProvider를 렌더링하므로 여기서 사용 가능
    const { setLanguage: setI18nLanguage, currentLanguage, isInitialized } = useTranslation();
    const prevStoreLanguageRef = React.useRef<string | null>(null);
    const initializedRef = React.useRef<boolean>(false);
    const hydratedRef = React.useRef<boolean>(false);
    const currentLanguageRef = React.useRef<string>(currentLanguage);
    
    // currentLanguage가 변경되면 ref 업데이트
    React.useEffect(() => {
      currentLanguageRef.current = currentLanguage;
    }, [currentLanguage]);
    
    // 하이드레이션 완료 감지 (클라이언트에서만, 한 번만 실행)
    React.useEffect(() => {
      if (typeof window === 'undefined') {
        return;
      }
      
      // 이미 하이드레이션 완료 체크를 했다면 스킵
      if (hydratedRef.current) {
        return;
      }
      
      // 하이드레이션이 완료되면 true로 설정
      // requestAnimationFrame을 사용하여 하이드레이션 완료 후 실행
      const checkHydration = () => {
        if (hydratedRef.current) {
          return; // 이미 실행됨
        }
        hydratedRef.current = true;
        
        // 하이드레이션 완료 후 저장된 언어로 동기화
        // 단, 초기 언어(initialLanguage)와 다를 때만 동기화
        // (초기 언어와 같으면 SSR과 일치하므로 동기화 불필요)
        if (isInitialized) {
          const storeLanguage = store.getState().language;
          // initialLanguage와 다르고, 현재 i18n 언어와도 다를 때만 동기화
          if (storeLanguage !== initialLanguage && storeLanguage !== currentLanguageRef.current) {
            setI18nLanguage(storeLanguage);
          }
        }
      };
      
      // 브라우저가 준비되면 하이드레이션 완료로 간주
      // setTimeout을 사용하여 하이드레이션 완료 후 실행
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(checkHydration);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }, [isInitialized]); // currentLanguage를 의존성에서 제거하여 무한 루프 방지
    
    // 언어 동기화 함수 (재사용)
    const syncLanguageFromStore = React.useCallback(() => {
      if (!isInitialized || !hydratedRef.current) {
        return;
      }
      
      const storeLanguage = store.getState().language;
      if (storeLanguage !== currentLanguageRef.current && storeLanguage !== initialLanguage) {
        setI18nLanguage(storeLanguage);
      }
    }, [isInitialized, setI18nLanguage, initialLanguage]);
    
    // 언어 변경 구독 설정
    React.useEffect(() => {
      // Translator가 초기화된 후에만 동기화
      if (!isInitialized) {
        return;
      }
      
      // 초기 동기화 플래그 설정 (한 번만)
      if (!initializedRef.current) {
        initializedRef.current = true;
        const storeLanguage = store.getState().language;
        prevStoreLanguageRef.current = storeLanguage;
      }
      
      // Zustand 스토어 변경 감지 (subscribe는 한 번만 설정)
      const unsubscribe = adapter.subscribe((newLanguage) => {
        // Zustand 스토어의 언어가 변경되면 i18n에 직접 동기화
        // 이벤트를 사용하지 않고 직접 setLanguage 호출 (순환 참조 방지)
        if (newLanguage !== prevStoreLanguageRef.current) {
          prevStoreLanguageRef.current = newLanguage;
          
          // 하이드레이션 완료 후에만 동기화
          if (hydratedRef.current) {
            // currentLanguageRef를 사용하여 최신 값 확인 (무한 루프 방지)
            if (newLanguage !== currentLanguageRef.current) {
              setI18nLanguage(newLanguage);
            }
          }
        }
      });
      
      // 하이드레이션이 이미 완료되었다면 즉시 동기화
      // 단, 초기 언어와 다를 때만 동기화 (초기 언어와 같으면 SSR과 일치하므로 동기화 불필요)
      if (hydratedRef.current) {
        const storeLanguage = store.getState().language;
        // initialLanguage와 다르고, 현재 i18n 언어와도 다를 때만 동기화
        if (storeLanguage !== initialLanguage && storeLanguage !== currentLanguageRef.current) {
          setI18nLanguage(storeLanguage);
        }
      }

      return unsubscribe;
    }, [isInitialized, setI18nLanguage]); // store와 adapter는 클로저로 캡처되므로 의존성 불필요
    
    // 하이드레이션 완료 후 언어 동기화를 위한 별도 useEffect
    // hydratedRef는 ref이므로 의존성으로 사용할 수 없음
    // 대신 하이드레이션 완료 시점에 직접 syncLanguageFromStore 호출

    return React.createElement(React.Fragment, null, innerChildren);
  }

  // Zustand 스토어 구독을 포함한 래퍼 Provider
  return function ZustandI18nProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(BaseI18nProvider, {
      children: React.createElement(LanguageSyncWrapper, { children })
    });
  };
}

/**
 * Zustand 스토어와 i18n-core를 통합하는 Hook
 * 
 * @param store - Zustand 스토어
 * @returns { language, setLanguage, t } - i18n 훅과 동일한 인터페이스
 * 
 * @example
 * ```tsx
 * import { useZustandI18n } from '@hua-labs/i18n-core-zustand';
 * import { useAppStore } from './store/useAppStore';
 * 
 * function MyComponent() {
 *   const { language, setLanguage, t } = useZustandI18n(useAppStore);
 *   
 *   return (
 *     <div>
 *       <p>{t('common:welcome')}</p>
 *       <button onClick={() => setLanguage('en')}>English</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useZustandI18n(
  store: UseBoundStore<StoreApi<ZustandLanguageStore>>
) {
  const adapter = React.useMemo(() => createZustandAdapter(store), [store]);
  
  // 스토어의 언어 상태 구독
  const language = store((state) => state.language);
  
  // 언어 변경 함수
  const setLanguage = React.useCallback(
    (lang: string) => {
      adapter.setLanguage(lang);
    },
    [adapter]
  );

  return {
    language,
    setLanguage,
    // useTranslation 훅은 별도로 import해서 사용
    // 이 함수는 Zustand 스토어와의 통합만 제공
  };
}

// 타입은 이미 위에서 export되었으므로 중복 export 제거

