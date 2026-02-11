/**
 * @hua-labs/hua/framework - Providers
 *
 * Unified providers for i18n, motion, icons, and state
 */

'use client';

import React from 'react';
import type { ReactNode } from 'react';
import type { HuaConfig } from '../types';
import { getConfig } from '../config';
import { createZustandI18n, type ZustandLanguageStore } from '@hua-labs/i18n-core-zustand';
import { createI18nStore, type UseBoundStore, type StoreApi } from '@hua-labs/state';
import { BrandingProvider } from '../branding/context';
import { IconProvider, ToastProvider } from '@hua-labs/ui';

/**
 * 언어 코드 배열을 LanguageConfig 배열로 변환
 * 
 * i18n-core는 LanguageConfig[] 형식을 기대하지만,
 * hua config는 편의를 위해 string[] 형식을 사용합니다.
 */
function toLanguageConfigs(languages: string[]): { code: string; name: string; nativeName: string }[] {
  const languageMap: Record<string, { name: string; nativeName: string }> = {
    ko: { name: 'Korean', nativeName: '한국어' },
    en: { name: 'English', nativeName: 'English' },
    ja: { name: 'Japanese', nativeName: '日本語' },
    zh: { name: 'Chinese', nativeName: '中文' },
    es: { name: 'Spanish', nativeName: 'Español' },
    fr: { name: 'French', nativeName: 'Français' },
    de: { name: 'German', nativeName: 'Deutsch' },
    pt: { name: 'Portuguese', nativeName: 'Português' },
    it: { name: 'Italian', nativeName: 'Italiano' },
    ru: { name: 'Russian', nativeName: 'Русский' },
  };

  return languages.map(code => ({
    code,
    name: languageMap[code]?.name || code,
    nativeName: languageMap[code]?.nativeName || code,
  }));
}

/**
 * Create providers based on configuration
 * 
 * Provider 체인을 생성합니다. Branding Provider는 가장 바깥쪽에 위치하여
 * 다른 Provider들이 브랜딩 설정을 사용할 수 있도록 합니다.
 * 
 * Creates a provider chain. Branding Provider is placed at the outermost level
 * so other providers can use branding configuration.
 */
function createProviders(config: HuaConfig) {
  const providers: React.ComponentType<{ children: ReactNode }>[] = [];

  // Branding Provider를 먼저 추가 (다른 Provider들이 사용 가능하도록)
  // Add Branding Provider first (so other providers can use it)
  if (config.branding) {
    providers.push(({ children }) => (
      <BrandingProvider branding={config.branding || null}>{children}</BrandingProvider>
    ));
  }

  // Toast Provider (기본값 적용)
  // Toast Provider (with defaults)
  const toastConfig = config.toast || {};
  providers.push(({ children }) => (
    <ToastProvider
      position={toastConfig.position || 'top-right'}
      maxToasts={toastConfig.maxToasts || 5}
    >
      {children}
    </ToastProvider>
  ));

  // Icon Provider (기본값 적용)
  // Icon Provider (with defaults)
  const iconConfig = config.icons || {};
  const iconSet = iconConfig.set || 'phosphor';
  providers.push(({ children }) => {
    // iconsax set 사용 시 resolver 자동 등록 (side-effect import 불필요)
    React.useEffect(() => {
      if (iconSet === 'iconsax') {
        import('@hua-labs/ui/iconsax').catch(() => {})
      }
    }, [])

    return (
      <IconProvider
        set={iconSet}
        weight={iconConfig.weight || 'regular'}
        size={iconConfig.size || 20}
        color={iconConfig.color || 'currentColor'}
        strokeWidth={iconConfig.strokeWidth || 1.25}
      >
        {children}
      </IconProvider>
    )
  });

  // i18n Provider
  if (config.i18n) {
    const i18nStore =
      config.i18n.languageStore ??
      createI18nStore({
        defaultLanguage: config.i18n.defaultLanguage,
        supportedLanguages: config.i18n.supportedLanguages,
        persist: config.state?.persist ?? true,
        ssr: config.state?.ssr ?? true,
      });

    // Type assertion: I18nStoreState extends ZustandLanguageStore, so this is safe
    const I18nProvider = createZustandI18n(
      i18nStore as UseBoundStore<StoreApi<ZustandLanguageStore>>,
      {
        fallbackLanguage: config.i18n.fallbackLanguage || 'en',
        namespaces: config.i18n.namespaces || ['common'],
        translationLoader: config.i18n.translationLoader || 'api',
        translationApiPath: config.i18n.translationApiPath || '/api/translations',
        defaultLanguage: config.i18n.defaultLanguage,
        loadTranslations: config.i18n.loadTranslations,
        debug: config.i18n.debug,
        initialTranslations: config.i18n.initialTranslations,
        supportedLanguages: config.i18n.supportedLanguages,
        storageKey: config.i18n.storageKey,
      }
    );

    providers.push(I18nProvider);
  }

  // Return a combined provider
  return function CombinedProvider({ children }: { children: ReactNode }) {
    // Provider 체인 생성 (Branding Provider가 가장 바깥쪽)
    // Create provider chain (Branding Provider is outermost)
    const wrapped = providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );

    return wrapped;
  };
}

/**
 * UnifiedProviders component
 * 
 * Automatically creates and wraps children with all necessary providers
 */
export function UnifiedProviders({
  children,
  config: overrideConfig,
}: {
  children: ReactNode;
  config?: Partial<HuaConfig>;
}) {
  const baseConfig = getConfig();
  const config = overrideConfig
    ? { ...baseConfig, ...overrideConfig }
    : baseConfig;

  const Provider = React.useMemo(() => createProviders(config), [config]);

  // Provider 체인은 createProviders 내부에서 처리됨
  // Provider chain is handled inside createProviders
  return <Provider>{children}</Provider>;
}
