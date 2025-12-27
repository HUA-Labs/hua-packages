/**
 * @hua-labs/state - Type Definitions
 * 
 * Core types for state management
 */

import type { StateCreator, StoreApi, UseBoundStore } from 'zustand';

/**
 * Base store state interface
 */
export interface BaseStoreState {
  [key: string]: unknown;
}

/**
 * Store creator function type
 */
export type StoreCreator<T extends BaseStoreState> = StateCreator<
  T,
  [],
  [],
  T
>;

/**
 * Store configuration options
 */
export interface StoreConfig {
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
  
  /**
   * Partialize function for persistence (select which state to persist)
   */
  partialize?: <T>(state: T) => Partial<T>;
}

/**
 * Zustand store type
 */
export type HuaStore<T extends BaseStoreState> = UseBoundStore<
  StoreApi<T>
>;
