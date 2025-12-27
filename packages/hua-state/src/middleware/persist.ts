/**
 * @hua-labs/state - Persist Middleware
 * 
 * Persistence configuration types
 * 
 * Note: The actual persist middleware is applied directly in create-store.ts
 * using Zustand's built-in persist middleware.
 */

/**
 * Persist middleware configuration
 */
export interface PersistConfig {
  /**
   * Storage key name
   */
  name: string;
  
  /**
   * Partialize function (select which state to persist)
   */
  partialize?: <T>(state: T) => Partial<T>;
  
  /**
   * Storage implementation (defaults to localStorage)
   */
  storage?: {
    getItem: (name: string) => string | null;
    setItem: (name: string, value: string) => void;
    removeItem: (name: string) => void;
  };
}
