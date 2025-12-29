import { createI18nStore } from '@hua-labs/state/integrations/i18n';

export const useAppStore = createI18nStore({
  defaultLanguage: 'ko',
  supportedLanguages: ['ko', 'en'],
  persist: true,
  ssr: true,
});
