/**
 * @hua-labs/state - Store Creation Utility
 * 
 * Creates Zustand stores with SSR and persistence support
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreCreator, StoreConfig, HuaStore, BaseStoreState } from './types';

/**
 * Create a hua-ux optimized Zustand store
 * 
 * @example
 * ```ts
 * const useAppStore = createHuaStore((set) => ({
 *   theme: 'light',
 *   setTheme: (theme) => set({ theme }),
 * }), {
 *   persist: true,
 *   persistKey: 'app-storage',
 *   ssr: true,
 * });
 * ```
 */
export function createHuaStore<T extends BaseStoreState>(
  storeCreator: StoreCreator<T>,
  config?: StoreConfig
): HuaStore<T> {
  const { persist: enablePersist = false, persistKey, ssr = false, partialize } = config || {};

  // If persist is enabled, wrap with persist middleware
  if (enablePersist) {
    return create<T>()(
      persist(
        storeCreator,
        {
          name: persistKey || 'hua-state-storage',
          partialize: partialize as any,
        }
      )
    );
  }

  // Otherwise, create a regular store
  return create<T>(storeCreator);
}
