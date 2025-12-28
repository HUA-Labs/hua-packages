'use client';

import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useAppStore } from '../store/useAppStore';

export const I18nProvider = createZustandI18n(useAppStore, {
  fallbackLanguage: 'en',
  namespaces: ['common'],
  translationLoader: 'api',
  translationApiPath: '/api/translations',
  defaultLanguage: 'ko',
  debug: process.env.NODE_ENV === 'development'
});
