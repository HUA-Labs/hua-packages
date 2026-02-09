import { createI18nStore } from '@hua-labs/hua/state';

export const useAppStore = createI18nStore({
  defaultLanguage: 'ko',
  supportedLanguages: ['ko', 'en'],
  persist: true,
  ssr: true,
});
