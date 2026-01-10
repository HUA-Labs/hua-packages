/**
 * @hua-labs/state
 * 
 * Unified state management for hua-ux framework with SSR support and integrations
 */

// Store creation
export { createHuaStore, isStoreRehydrated, onStoreRehydrated } from './store/create-store';
export type {
  StoreCreator,
  StoreConfig,
  HuaStore,
  BaseStoreState,
  UseBoundStore,
  StoreApi
} from './store/types';

// i18n integration
export { createI18nStore } from './integrations/i18n';
export type { 
  I18nStoreState, 
  I18nStoreConfig 
} from './integrations/i18n';

// Hooks
export type { UseStoreHook } from './hooks/use-store';
