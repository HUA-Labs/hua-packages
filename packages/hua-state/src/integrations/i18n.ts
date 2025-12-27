/**
 * @hua-labs/state - i18n Integration
 * 
 * Pre-configured store for i18n language management
 */

import { createHuaStore } from '../store/create-store';
import type { HuaStore } from '../store/types';

/**
 * i18n store state interface
 */
export interface I18nStoreState {
  language: string;
  setLanguage: (lang: string) => void;
}

/**
 * i18n store configuration
 */
export interface I18nStoreConfig {
  /**
   * Default language
   */
  defaultLanguage: string;
  
  /**
   * Supported languages
   */
  supportedLanguages: string[];
  
  /**
   * Enable persistence
   */
  persist?: boolean;
  
  /**
   * Persistence storage key
   */
  persistKey?: string;
  
  /**
   * Enable SSR support
   */
  ssr?: boolean;
}

/**
 * Create a pre-configured i18n store
 * 
 * @example
 * ```ts
 * const useI18nStore = createI18nStore({
 *   defaultLanguage: 'ko',
 *   supportedLanguages: ['ko', 'en'],
 *   persist: true,
 *   ssr: true,
 * });
 * ```
 */
export function createI18nStore(
  config: I18nStoreConfig
): HuaStore<I18nStoreState> {
  const { defaultLanguage, supportedLanguages, persist = true, persistKey, ssr = true } = config;

  return createHuaStore<I18nStoreState>(
    (set) => ({
      language: defaultLanguage,
      setLanguage: (lang: string) => {
        // Validate language is supported
        if (supportedLanguages.includes(lang)) {
          set({ language: lang });
        } else {
          console.warn(`Language "${lang}" is not supported. Supported languages: ${supportedLanguages.join(', ')}`);
        }
      },
    }),
    {
      persist,
      persistKey: persistKey || 'hua-i18n-storage',
      ssr,
      partialize: (state) => ({ language: state.language }),
    }
  );
}
