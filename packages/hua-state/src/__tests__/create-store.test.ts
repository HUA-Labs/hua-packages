import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHuaStore, isStoreRehydrated, onStoreRehydrated, markStoreRehydrated } from '../store/create-store';

// Reset the module-level Maps between tests
// Since rehydrationStatus and rehydrationListeners are module-level singletons,
// we need to clean them up between tests
beforeEach(() => {
  // Reset by marking known keys as we go - there's no public clear method
  // But we can use markStoreRehydrated idempotently and test fresh keys each time
});

describe('createHuaStore', () => {
  describe('basic store creation', () => {
    it('should create a basic store without persistence', () => {
      const useStore = createHuaStore<{ count: number; increment: () => void }>((set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }));

      expect(useStore.getState().count).toBe(0);
    });

    it('should update state correctly', () => {
      const useStore = createHuaStore<{ count: number; increment: () => void }>((set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }));

      useStore.getState().increment();
      expect(useStore.getState().count).toBe(1);
    });

    it('should support selectors', () => {
      const useStore = createHuaStore<{ name: string; age: number }>((set) => ({
        name: 'Test',
        age: 25,
      }));

      expect(useStore.getState().name).toBe('Test');
      expect(useStore.getState().age).toBe(25);
    });
  });

  describe('with persistence', () => {
    it('should create a persisted store', () => {
      const useStore = createHuaStore<{ theme: string; setTheme: (t: string) => void }>((set) => ({
        theme: 'light',
        setTheme: (theme: string) => set({ theme }),
      }), {
        persist: true,
        persistKey: 'test-persist-store',
      });

      expect(useStore.getState().theme).toBe('light');
    });

    it('should use default key when persistKey is not provided', () => {
      const useStore = createHuaStore<{ value: string }>((set) => ({
        value: 'test',
      }), {
        persist: true,
      });

      expect(useStore.getState().value).toBe('test');
    });

    it('should support partialize option', () => {
      const useStore = createHuaStore<{ data: string; temp: string }>((set) => ({
        data: 'persistent',
        temp: 'temporary',
      }), {
        persist: true,
        persistKey: 'test-partialize',
        partialize: (state) => ({ data: state.data }),
      });

      expect(useStore.getState().data).toBe('persistent');
    });
  });

  describe('store subscription', () => {
    it('should support subscribe', () => {
      const useStore = createHuaStore<{ value: number; setValue: (v: number) => void }>((set) => ({
        value: 0,
        setValue: (v: number) => set({ value: v }),
      }));

      const listener = vi.fn();
      useStore.subscribe(listener);
      useStore.getState().setValue(42);
      expect(listener).toHaveBeenCalled();
    });
  });
});

describe('rehydration utilities', () => {
  // Use unique keys per test to avoid interference
  let testKeyCounter = 0;
  const getUniqueKey = () => `test-rehydration-${Date.now()}-${testKeyCounter++}`;

  describe('isStoreRehydrated', () => {
    it('should return false for unknown key', () => {
      expect(isStoreRehydrated(getUniqueKey())).toBe(false);
    });

    it('should return true after marking as rehydrated', () => {
      const key = getUniqueKey();
      markStoreRehydrated(key);
      expect(isStoreRehydrated(key)).toBe(true);
    });
  });

  describe('markStoreRehydrated', () => {
    it('should mark store as rehydrated', () => {
      const key = getUniqueKey();
      markStoreRehydrated(key);
      expect(isStoreRehydrated(key)).toBe(true);
    });

    it('should notify listeners', () => {
      const key = getUniqueKey();
      const callback = vi.fn();
      onStoreRehydrated(key, callback);
      markStoreRehydrated(key);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should clear listeners after notification', () => {
      const key = getUniqueKey();
      const callback = vi.fn();
      onStoreRehydrated(key, callback);
      markStoreRehydrated(key);
      markStoreRehydrated(key); // second call - should be idempotent
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should be idempotent', () => {
      const key = getUniqueKey();
      markStoreRehydrated(key);
      markStoreRehydrated(key);
      expect(isStoreRehydrated(key)).toBe(true);
    });
  });

  describe('onStoreRehydrated', () => {
    it('should call callback immediately if already rehydrated', () => {
      const key = getUniqueKey();
      markStoreRehydrated(key);
      const callback = vi.fn();
      onStoreRehydrated(key, callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      const key = getUniqueKey();
      const callback = vi.fn();
      const unsubscribe = onStoreRehydrated(key, callback);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should not call after unsubscribe', () => {
      const key = getUniqueKey();
      const callback = vi.fn();
      const unsubscribe = onStoreRehydrated(key, callback);
      unsubscribe();
      markStoreRehydrated(key);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const key = getUniqueKey();
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      onStoreRehydrated(key, cb1);
      onStoreRehydrated(key, cb2);
      markStoreRehydrated(key);
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });
  });
});
