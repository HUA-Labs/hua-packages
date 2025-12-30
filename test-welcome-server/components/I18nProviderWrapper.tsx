'use client';

import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useAppStore } from '@/store/useAppStore';

// Client Component 내에서 I18nProvider 생성
// Server Component에서 함수를 전달하는 문제를 방지하기 위해 Client Component로 분리
const I18nProvider = createZustandI18n(useAppStore, {
  fallbackLanguage: 'en',
  namespaces: ['common'],
  translationLoader: 'api',
  translationApiPath: '/api/translations',
  defaultLanguage: 'ko',
  debug: process.env.NODE_ENV === 'development'
});

export function I18nProviderWrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
