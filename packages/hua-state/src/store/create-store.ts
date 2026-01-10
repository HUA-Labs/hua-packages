/**
 * @hua-labs/state - Store Creation Utility
 *
 * Creates Zustand stores with SSR and persistence support
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreCreator, StoreConfig, HuaStore, BaseStoreState } from './types';

/**
 * Rehydration listeners for each store
 */
const rehydrationListeners = new Map<string, Set<() => void>>();
const rehydrationStatus = new Map<string, boolean>();

/**
 * Check if a store has been rehydrated
 */
export function isStoreRehydrated(persistKey: string): boolean {
  return rehydrationStatus.get(persistKey) ?? false;
}

/**
 * Subscribe to rehydration completion
 * Returns unsubscribe function
 */
export function onStoreRehydrated(persistKey: string, callback: () => void): () => void {
  // If already rehydrated, call immediately
  if (rehydrationStatus.get(persistKey)) {
    callback();
    return () => {};
  }

  // Add to listeners
  if (!rehydrationListeners.has(persistKey)) {
    rehydrationListeners.set(persistKey, new Set());
  }
  rehydrationListeners.get(persistKey)!.add(callback);

  return () => {
    rehydrationListeners.get(persistKey)?.delete(callback);
  };
}

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
  config?: StoreConfig<T>
): HuaStore<T> {
  const { persist: enablePersist = false, persistKey, ssr = false, partialize } = config || {};
  const storageKey = persistKey || 'hua-state-storage';

  // If persist is enabled, wrap with persist middleware
  if (enablePersist) {
    return create<T>()(
      persist(
        storeCreator,
        {
          name: storageKey,
          partialize,
          onRehydrateStorage: () => (state) => {
            // Mark as rehydrated and notify listeners
            rehydrationStatus.set(storageKey, true);
            const listeners = rehydrationListeners.get(storageKey);
            if (listeners) {
              listeners.forEach(cb => cb());
              listeners.clear();
            }
          },
        }
      )
    );
  }

  // Otherwise, create a regular store
  return create<T>(storeCreator);
}
