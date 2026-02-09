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
import { onStoreRehydrated } from '@hua-labs/state';
import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * 지원되는 언어 코드 타입
 * ISO 639-1 표준 언어 코드
 */
export type SupportedLanguage = 'ko' | 'en' | 'ja';

/**
 * Zustand 스토어에서 언어 관련 상태를 가져오는 인터페이스
 * 
 * @template L - 언어 코드 타입 (기본값: SupportedLanguage | string)
 * 
 * @example
 * ```typescript
 * // 기본 사용 (모든 언어 코드 허용)
 * interface MyStore extends ZustandLanguageStore {}
 * 
 * // 특정 언어만 허용
 * interface MyStore extends ZustandLanguageStore<'ko' | 'en'> {}
 * ```
 */
export interface ZustandLanguageStore<L extends string = SupportedLanguage | string> {
  language: L;
  setLanguage: (lang: L) => void;
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
 * 
 * @template L - 언어 코드 타입
 */
function createZustandAdapter<L extends string = SupportedLanguage | string>(
  store: UseBoundStore<StoreApi<ZustandLanguageStore<L>>>
): ZustandI18nAdapter {
  return {
    getLanguage: () => store.getState().language,
    setLanguage: (lang: string) => {
      const currentLang = store.getState().language;
      if (currentLang !== lang) {
        // 어댑터는 string을 받지만, 스토어는 L 타입을 기대하므로 타입 단언 필요
        store.getState().setLanguage(lang as L);
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
  supportedLanguages?: Array<{ code: string; name: string; nativeName: string }> | string[];
  autoLanguageSync?: boolean;
  /**
   * document.documentElement.lang 자동 업데이트 여부
   * 기본값: false (사용자가 직접 관리)
   * true로 설정하면 언어 변경 시 자동으로 html[lang] 속성 업데이트
   */
  autoUpdateHtmlLang?: boolean;
  /**
   * Zustand persist 스토리지 키
   * 하이드레이션 완료 감지에 사용됨
   * 기본값: 'hua-i18n-storage'
   *
   * @example
   * ```ts
   * // useAppStore가 'my-app-app-storage' 키를 사용하는 경우
   * const I18nProvider = createZustandI18n(useAppStore, {
   *   storageKey: 'my-app-app-storage',
   *   // ...
   * });
   * ```
   */
  storageKey?: string;
}

/**
 * Zustand 스토어와 i18n-core를 통합하는 Provider 생성
 * 
 * @template L - 언어 코드 타입
 * @param store - Zustand 스토어 (language와 setLanguage 메서드 필요)
 * @param config - i18n 설정
 * @returns I18nProvider 컴포넌트
 */
export function createZustandI18n<L extends string = SupportedLanguage | string>(
  store: UseBoundStore<StoreApi<ZustandLanguageStore<L>>>,
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
    const debug = config?.debug ?? false;
    const autoUpdateHtmlLang = config?.autoUpdateHtmlLang ?? false;
    const storageKey = config?.storageKey ?? 'hua-i18n-storage';
    // useTranslation은 I18nProvider 내부에서만 사용 가능
    // BaseI18nProvider가 I18nProvider를 렌더링하므로 여기서 사용 가능
    const { setLanguage: setI18nLanguage, currentLanguage, isInitialized } = useTranslation();
    
    // document.documentElement.lang 자동 업데이트
    React.useEffect(() => {
      if (autoUpdateHtmlLang && typeof document !== 'undefined') {
        document.documentElement.lang = currentLanguage;
        if (debug) {
          if (process.env.NODE_ENV !== 'production') console.log(`[ZUSTAND-I18N] Updated html[lang] to: ${currentLanguage}`);
        }
      }
    }, [currentLanguage, autoUpdateHtmlLang, debug]);
    
    // 하이드레이션 상태를 하나의 객체로 관리
    interface HydrationState {
      isComplete: boolean;
      isInitialized: boolean;
      previousStoreLanguage: string | null;
      currentI18nLanguage: string;
      isSyncing: boolean;  // 동기화 중 플래그 (무한루프 방지)
    }

    const hydrationStateRef = React.useRef<HydrationState>({
      isComplete: false,
      isInitialized: false,
      previousStoreLanguage: null,
      currentI18nLanguage: currentLanguage,
      isSyncing: false,
    });
    
    // currentLanguage가 변경되면 상태 업데이트 + Zustand store 동기화
    React.useEffect(() => {
      const state = hydrationStateRef.current;
      state.currentI18nLanguage = currentLanguage;

      // i18n → Zustand 역방향 동기화 (localStorage 저장을 위해)
      if (state.isComplete && !state.isSyncing) {
        const storeLanguage = store.getState().language;
        if (storeLanguage !== currentLanguage) {
          if (debug) {
            if (process.env.NODE_ENV !== 'production') console.log(`🔄 [ZUSTAND-I18N] Syncing i18n -> store: ${storeLanguage} -> ${currentLanguage}`);
          }
          state.isSyncing = true;
          store.getState().setLanguage(currentLanguage as L);
          state.previousStoreLanguage = currentLanguage;
          state.isSyncing = false;
        }
      }
    }, [currentLanguage, debug]);
    
    // Zustand persist rehydration 완료 후 언어 동기화
    React.useEffect(() => {
      if (typeof window === 'undefined' || hydrationStateRef.current.isComplete) {
        return;
      }

      // Zustand persist rehydration 완료를 기다림
      const unsubscribe = onStoreRehydrated(storageKey, () => {
        if (hydrationStateRef.current.isComplete) {
          return;
        }

        hydrationStateRef.current.isComplete = true;
        hydrationStateRef.current.isInitialized = isInitialized;

        if (debug) {
          if (process.env.NODE_ENV !== 'production') console.log(`✅ [ZUSTAND-I18N] Store rehydration complete`);
        }

        // rehydration 완료 후 저장된 언어로 동기화
        const storeLanguage = store.getState().language;
        const state = hydrationStateRef.current;

        // 현재 i18n 언어와 다를 때만 동기화
        if (storeLanguage !== state.currentI18nLanguage && !state.isSyncing) {
          if (debug) {
            if (process.env.NODE_ENV !== 'production') console.log(`🔄 [ZUSTAND-I18N] Syncing language after rehydration: ${state.currentI18nLanguage} -> ${storeLanguage}`);
          }
          state.isSyncing = true;
          setI18nLanguage(storeLanguage);
          state.previousStoreLanguage = storeLanguage;
          state.isSyncing = false;
        } else {
          if (debug) {
            if (process.env.NODE_ENV !== 'production') console.log(`⏭️ [ZUSTAND-I18N] No sync needed (store: ${storeLanguage}, current: ${state.currentI18nLanguage})`);
          }
          state.previousStoreLanguage = storeLanguage;
        }
      });

      return unsubscribe;
    }, [isInitialized, setI18nLanguage, debug]);
    
    // 언어 동기화 함수 (재사용)
    const syncLanguageFromStore = React.useCallback(() => {
      const state = hydrationStateRef.current;
      if (!state.isInitialized || !state.isComplete) {
        return;
      }

      const storeLanguage = store.getState().language;
      if (storeLanguage !== state.currentI18nLanguage) {
        if (debug) {
          if (process.env.NODE_ENV !== 'production') console.log(`🔄 [ZUSTAND-I18N] Syncing language from store: ${state.currentI18nLanguage} -> ${storeLanguage}`);
        }
        setI18nLanguage(storeLanguage);
        state.previousStoreLanguage = storeLanguage;
      }
    }, [setI18nLanguage, debug]);
    
    // 언어 변경 구독 설정
    React.useEffect(() => {
      // Translator가 초기화된 후에만 동기화
      if (!isInitialized) {
        return;
      }
      
      const state = hydrationStateRef.current;
      state.isInitialized = true;
      
      // 초기 스토어 언어 설정
      if (state.previousStoreLanguage === null) {
        state.previousStoreLanguage = store.getState().language;
      }
      
      // Zustand 스토어 변경 감지
      const unsubscribe = adapter.subscribe((newLanguage) => {
        // 동기화 중이면 무시 (무한루프 방지)
        if (state.isSyncing) return;

        // 이전 언어와 다를 때만 처리
        if (newLanguage !== state.previousStoreLanguage) {
          state.previousStoreLanguage = newLanguage;

          // 하이드레이션 완료 후에만 동기화
          if (state.isComplete && newLanguage !== state.currentI18nLanguage) {
            if (debug) {
              if (process.env.NODE_ENV !== 'production') console.log(`🔄 [ZUSTAND-I18N] Store language changed, syncing to i18n: ${state.currentI18nLanguage} -> ${newLanguage}`);
            }
            state.isSyncing = true;
            setI18nLanguage(newLanguage);
            state.isSyncing = false;
          }
        }
      });
      
      // 하이드레이션이 이미 완료되었다면 즉시 동기화
      if (state.isComplete && !state.isSyncing) {
        const storeLanguage = store.getState().language;
        if (storeLanguage !== state.currentI18nLanguage) {
          if (debug) {
            if (process.env.NODE_ENV !== 'production') console.log(`🔄 [ZUSTAND-I18N] Already hydrated, syncing language: ${state.currentI18nLanguage} -> ${storeLanguage}`);
          }
          state.isSyncing = true;
          setI18nLanguage(storeLanguage);
          state.previousStoreLanguage = storeLanguage;
          state.isSyncing = false;
        }
      }

      return unsubscribe;
    }, [isInitialized, setI18nLanguage, debug]);
    
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
/**
 * Zustand 스토어와 i18n-core를 통합하는 Hook
 * 
 * @template L - 언어 코드 타입
 * @param store - Zustand 스토어
 * @returns { language, setLanguage } - 언어 상태 및 변경 함수
 */
export function useZustandI18n<L extends string = SupportedLanguage | string>(
  store: UseBoundStore<StoreApi<ZustandLanguageStore<L>>>
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

