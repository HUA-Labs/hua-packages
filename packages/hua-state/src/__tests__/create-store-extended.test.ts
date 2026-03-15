/**
 * Extended tests for createHuaStore, isStoreRehydrated, onStoreRehydrated, markStoreRehydrated
 *
 * Covers edge cases not addressed in create-store.test.ts:
 * - Empty / undefined config
 * - Multiple independent stores
 * - setState API
 * - Persist cleanup on re-creation
 * - Complex partialize
 * - Multiple concurrent listeners
 * - Listener registration after rehydration
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createHuaStore,
  isStoreRehydrated,
  onStoreRehydrated,
  markStoreRehydrated,
} from "../store/create-store";

// Unique key generator scoped to this file
let keySeq = 0;
const uid = () => `ext-${Date.now()}-${keySeq++}`;

afterEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// createHuaStore — no-config / undefined-config edge cases
// ---------------------------------------------------------------------------
describe("createHuaStore — config edge cases", () => {
  it("should create a store when config is undefined", () => {
    const store = createHuaStore<{ x: number }>(() => ({ x: 7 }));
    expect(store.getState().x).toBe(7);
  });

  it("should create a store when config is an empty object", () => {
    const store = createHuaStore<{ x: number }>(() => ({ x: 42 }), {});
    expect(store.getState().x).toBe(42);
  });

  it("should use default persistKey when persist is true and persistKey is omitted", () => {
    // Two stores with no persistKey share the same default key ('hua-state-storage').
    // The second createHuaStore call resets that key's rehydration state.
    // After creation both should still read the correct initial state.
    const storeA = createHuaStore<{ v: string }>(() => ({ v: "a" }), {
      persist: true,
    });
    expect(storeA.getState().v).toBe("a");
  });

  it("should create with ssr: true without errors", () => {
    const store = createHuaStore<{ flag: boolean }>(() => ({ flag: true }), {
      ssr: true,
    });
    expect(store.getState().flag).toBe(true);
  });

  it("should create with persist: false explicitly", () => {
    const store = createHuaStore<{ n: number }>(() => ({ n: 99 }), {
      persist: false,
    });
    expect(store.getState().n).toBe(99);
  });
});

// ---------------------------------------------------------------------------
// createHuaStore — multiple independent stores
// ---------------------------------------------------------------------------
describe("createHuaStore — multiple independent stores", () => {
  it("should keep state isolated between two stores", () => {
    const storeA = createHuaStore<{ val: number; set: (v: number) => void }>(
      (set) => ({ val: 0, set: (v) => set({ val: v }) }),
    );
    const storeB = createHuaStore<{ val: number; set: (v: number) => void }>(
      (set) => ({ val: 100, set: (v) => set({ val: v }) }),
    );

    storeA.getState().set(5);
    expect(storeA.getState().val).toBe(5);
    expect(storeB.getState().val).toBe(100); // unaffected
  });

  it("should allow two persisted stores with different keys", () => {
    const storeA = createHuaStore<{ theme: string }>(
      () => ({ theme: "light" }),
      { persist: true, persistKey: uid() },
    );
    const storeB = createHuaStore<{ theme: string }>(
      () => ({ theme: "dark" }),
      { persist: true, persistKey: uid() },
    );

    expect(storeA.getState().theme).toBe("light");
    expect(storeB.getState().theme).toBe("dark");
  });
});

// ---------------------------------------------------------------------------
// createHuaStore — setState and getState API
// ---------------------------------------------------------------------------
describe("createHuaStore — setState / getState", () => {
  it("should support direct setState call", () => {
    const store = createHuaStore<{ count: number; label: string }>(() => ({
      count: 0,
      label: "init",
    }));

    store.setState({ count: 10 });
    expect(store.getState().count).toBe(10);
    expect(store.getState().label).toBe("init"); // other keys preserved via merge
  });

  it("should support functional setState", () => {
    const store = createHuaStore<{ count: number }>(() => ({ count: 5 }));

    store.setState((prev) => ({ count: prev.count + 3 }));
    expect(store.getState().count).toBe(8);
  });

  it("should notify subscriber on setState", () => {
    const store = createHuaStore<{ val: number }>(() => ({ val: 0 }));
    const cb = vi.fn();
    store.subscribe(cb);
    store.setState({ val: 99 });
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// createHuaStore — subscribe / unsubscribe
// ---------------------------------------------------------------------------
describe("createHuaStore — subscribe / unsubscribe", () => {
  it("should stop notifying after unsubscribe", () => {
    const store = createHuaStore<{ v: number; set: (n: number) => void }>(
      (set) => ({ v: 0, set: (n) => set({ v: n }) }),
    );
    const cb = vi.fn();
    const unsub = store.subscribe(cb);
    store.getState().set(1);
    unsub();
    store.getState().set(2);
    expect(cb).toHaveBeenCalledTimes(1); // only first change
  });

  it("should support multiple independent subscribers", () => {
    const store = createHuaStore<{ v: number; inc: () => void }>((set) => ({
      v: 0,
      inc: () => set((s) => ({ v: s.v + 1 })),
    }));
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    store.subscribe(cb1);
    store.subscribe(cb2);
    store.getState().inc();
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// createHuaStore — partialize edge cases
// ---------------------------------------------------------------------------
describe("createHuaStore — partialize edge cases", () => {
  it("should accept partialize that returns empty object", () => {
    const store = createHuaStore<{ secret: string; public: string }>(
      () => ({ secret: "hidden", public: "visible" }),
      {
        persist: true,
        persistKey: uid(),
        partialize: () => ({}),
      },
    );
    expect(store.getState().secret).toBe("hidden");
    expect(store.getState().public).toBe("visible");
  });

  it("should accept partialize that returns full state", () => {
    const store = createHuaStore<{ a: string; b: string }>(
      () => ({ a: "foo", b: "bar" }),
      {
        persist: true,
        persistKey: uid(),
        partialize: (state) => ({ a: state.a, b: state.b }),
      },
    );
    expect(store.getState().a).toBe("foo");
    expect(store.getState().b).toBe("bar");
  });
});

// ---------------------------------------------------------------------------
// createHuaStore — re-creation resets rehydration state (then re-rehydrates)
// ---------------------------------------------------------------------------
describe("createHuaStore — re-creation resets rehydration state", () => {
  it("should result in a rehydrated store after re-creation with same key", () => {
    const key = uid();
    // First store: persist middleware calls onRehydrateStorage synchronously
    // when localStorage is empty, so the store is immediately rehydrated.
    createHuaStore<{ x: number }>(() => ({ x: 1 }), {
      persist: true,
      persistKey: key,
    });
    expect(isStoreRehydrated(key)).toBe(true);

    // Re-create with same key — createHuaStore clears the status, then
    // Zustand's persist middleware immediately calls onRehydrateStorage again
    // (synchronously, because localStorage is still empty / already loaded).
    // End result: isStoreRehydrated is true again.
    createHuaStore<{ x: number }>(() => ({ x: 2 }), {
      persist: true,
      persistKey: key,
    });
    // The re-creation cycle completes and rehydration fires again
    expect(isStoreRehydrated(key)).toBe(true);
  });

  it("createHuaStore with persist:true clears and then re-sets rehydration atomically", () => {
    const key = uid();
    // Verify the internal reset-then-rehydrate cycle does not leave status permanently false
    const store = createHuaStore<{ x: number }>(() => ({ x: 1 }), {
      persist: true,
      persistKey: key,
    });
    // After synchronous creation + rehydration, the store must be rehydrated
    expect(isStoreRehydrated(key)).toBe(true);
    expect(store.getState().x).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// isStoreRehydrated — extended
// ---------------------------------------------------------------------------
describe("isStoreRehydrated — extended", () => {
  it("should return false for empty-string key", () => {
    expect(isStoreRehydrated("")).toBe(false);
  });

  it("should return false for key with only whitespace", () => {
    expect(isStoreRehydrated("   ")).toBe(false);
  });

  it("should return false for numeric-looking key that was never set", () => {
    expect(isStoreRehydrated("12345")).toBe(false);
  });

  it("should handle multiple distinct keys independently", () => {
    const k1 = uid();
    const k2 = uid();
    markStoreRehydrated(k1);
    expect(isStoreRehydrated(k1)).toBe(true);
    expect(isStoreRehydrated(k2)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// markStoreRehydrated — extended
// ---------------------------------------------------------------------------
describe("markStoreRehydrated — extended", () => {
  it("should call all pending listeners exactly once", () => {
    const key = uid();
    const cbs = Array.from({ length: 5 }, () => vi.fn());
    cbs.forEach((cb) => onStoreRehydrated(key, cb));
    markStoreRehydrated(key);
    cbs.forEach((cb) => expect(cb).toHaveBeenCalledTimes(1));
  });

  it("should not call unsubscribed listener", () => {
    const key = uid();
    const cb = vi.fn();
    const unsub = onStoreRehydrated(key, cb);
    unsub();
    markStoreRehydrated(key);
    expect(cb).not.toHaveBeenCalled();
  });

  it("should allow re-registration after unsubscribe (key still not rehydrated)", () => {
    const key = uid();
    const cb = vi.fn();
    const unsub = onStoreRehydrated(key, cb);
    unsub();
    // Register again
    onStoreRehydrated(key, cb);
    markStoreRehydrated(key);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("should remain idempotent across 10 calls", () => {
    const key = uid();
    const cb = vi.fn();
    onStoreRehydrated(key, cb);
    for (let i = 0; i < 10; i++) {
      markStoreRehydrated(key);
    }
    expect(cb).toHaveBeenCalledTimes(1);
    expect(isStoreRehydrated(key)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onStoreRehydrated — extended
// ---------------------------------------------------------------------------
describe("onStoreRehydrated — extended", () => {
  it("should call callback immediately for already-rehydrated key and return noop unsubscribe", () => {
    const key = uid();
    markStoreRehydrated(key);
    const cb = vi.fn();
    const unsub = onStoreRehydrated(key, cb);
    expect(cb).toHaveBeenCalledTimes(1);
    // The returned unsubscribe is a noop but must be a function
    expect(typeof unsub).toBe("function");
    unsub(); // should not throw
  });

  it("should support registering same callback twice for same key", () => {
    const key = uid();
    const cb = vi.fn();
    onStoreRehydrated(key, cb);
    onStoreRehydrated(key, cb);
    markStoreRehydrated(key);
    // A Set deduplicates identical references, so callback fires once
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("should support registering callbacks for different keys independently", () => {
    const k1 = uid();
    const k2 = uid();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    onStoreRehydrated(k1, cb1);
    onStoreRehydrated(k2, cb2);
    markStoreRehydrated(k1);
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).not.toHaveBeenCalled();
  });

  it("unsubscribed callback should not fire even when rehydrated later", () => {
    const key = uid();
    const cb = vi.fn();
    const unsub = onStoreRehydrated(key, cb);
    unsub();
    markStoreRehydrated(key);
    // Rehydrate a second time (no-op) but callback should still be 0
    markStoreRehydrated(key);
    expect(cb).not.toHaveBeenCalled();
  });
});
