/**
 * @hua-labs/state - Store Hooks
 * 
 * Convenience hooks for working with stores
 */

import type { HuaStore, BaseStoreState } from '../store/types';

/**
 * Use store hook (re-export for convenience)
 * 
 * This is just a type-safe wrapper around Zustand's useStore
 * The actual usage is the same as Zustand's useStore
 * 
 * @example
 * ```ts
 * const useAppStore = createHuaStore(...);
 * 
 * function MyComponent() {
 *   const theme = useAppStore((state) => state.theme);
 *   const setTheme = useAppStore((state) => state.setTheme);
 *   // ...
 * }
 * ```
 */
export type UseStoreHook<T extends BaseStoreState> = HuaStore<T>;
