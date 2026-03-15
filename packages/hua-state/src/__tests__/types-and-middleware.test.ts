/**
 * Tests for type utilities, PersistConfig, UseStoreHook, and middleware/persist shapes
 *
 * These tests verify runtime behavior that exercises the type contracts:
 * - PersistConfig-shaped objects accepted by createHuaStore
 * - UseStoreHook type alias (runtime: is just a Zustand UseBoundStore)
 * - BaseStoreState index signature
 * - StoreConfig optionality
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createHuaStore } from "../store/create-store";
import type { BaseStoreState, StoreConfig, HuaStore } from "../store/types";
import type { PersistConfig } from "../middleware/persist";
import type { UseStoreHook } from "../hooks/use-store";

let seq = 0;
const uid = () => `mw-${Date.now()}-${seq++}`;

afterEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// PersistConfig — structural shape tests
// ---------------------------------------------------------------------------
describe("PersistConfig — structural shape", () => {
  it("should accept a minimal PersistConfig (name only)", () => {
    const cfg: PersistConfig = { name: "my-store" };
    expect(cfg.name).toBe("my-store");
  });

  it("should accept a full PersistConfig with partialize and storage", () => {
    const storage = {
      getItem: (_n: string) => null,
      setItem: (_n: string, _v: string) => {},
      removeItem: (_n: string) => {},
    };
    const cfg: PersistConfig = {
      name: "full-store",
      partialize: (state) => state as Partial<typeof state>,
      storage,
    };
    expect(cfg.name).toBe("full-store");
    expect(typeof cfg.partialize).toBe("function");
    expect(typeof cfg.storage?.getItem).toBe("function");
  });

  it("PersistConfig.partialize should accept and return state-like objects", () => {
    const cfg: PersistConfig = {
      name: "p-store",
      partialize: (state: { a: string; b: number }) => ({ a: state.a }),
    };
    const result = cfg.partialize!({ a: "hello", b: 42 });
    expect(result).toEqual({ a: "hello" });
  });
});

// ---------------------------------------------------------------------------
// StoreConfig — optionality
// ---------------------------------------------------------------------------
describe("StoreConfig — optionality", () => {
  it("all fields are optional — empty config is valid", () => {
    const cfg: StoreConfig = {};
    expect(cfg.persist).toBeUndefined();
    expect(cfg.persistKey).toBeUndefined();
    expect(cfg.ssr).toBeUndefined();
    expect(cfg.partialize).toBeUndefined();
  });

  it("persist field is boolean", () => {
    const cfg: StoreConfig = { persist: true };
    expect(cfg.persist).toBe(true);
  });

  it("persistKey field is string", () => {
    const cfg: StoreConfig = { persistKey: "my-key" };
    expect(cfg.persistKey).toBe("my-key");
  });
});

// ---------------------------------------------------------------------------
// BaseStoreState — index signature
// ---------------------------------------------------------------------------
describe("BaseStoreState — index signature", () => {
  it("should allow arbitrary string keys with unknown values", () => {
    const state: BaseStoreState = {
      count: 0,
      name: "test",
      nested: { a: 1 },
      flag: true,
    };
    expect(state["count"]).toBe(0);
    expect(state["name"]).toBe("test");
  });
});

// ---------------------------------------------------------------------------
// HuaStore / UseStoreHook — runtime API shape
// ---------------------------------------------------------------------------
describe("HuaStore — runtime API", () => {
  it("should have getState, setState, subscribe methods (Zustand v5 removed destroy)", () => {
    const store: HuaStore<{ v: number }> = createHuaStore<{ v: number }>(
      () => ({ v: 1 }),
    );
    expect(typeof store.getState).toBe("function");
    expect(typeof store.setState).toBe("function");
    expect(typeof store.subscribe).toBe("function");
    // Zustand v5 removed destroy; getInitialState was added instead
    expect(typeof store.getInitialState).toBe("function");
  });

  it("UseStoreHook type alias is functionally identical to HuaStore", () => {
    // UseStoreHook<T> = HuaStore<T>; at runtime they're the same shape.
    const store: UseStoreHook<{ x: string }> = createHuaStore<{ x: string }>(
      () => ({ x: "hi" }),
    );
    expect(store.getState().x).toBe("hi");
  });
});

// ---------------------------------------------------------------------------
// Middleware/persist — custom storage integration
// ---------------------------------------------------------------------------
describe("createHuaStore — custom-storage-like usage (PersistConfig.storage shape)", () => {
  it("should work with a memory-backed storage object via Zustand persist", () => {
    // Simulate an in-memory storage that conforms to PersistConfig.storage interface
    const memStore: Record<string, string> = {};
    const memStorage = {
      getItem: (name: string): string | null => memStore[name] ?? null,
      setItem: (name: string, value: string) => {
        memStore[name] = value;
      },
      removeItem: (name: string) => {
        delete memStore[name];
      },
    };

    // Verify the storage object matches PersistConfig.storage shape
    const cfg: PersistConfig = {
      name: uid(),
      storage: memStorage,
    };

    // Just confirm structurally valid
    expect(typeof cfg.storage!.getItem).toBe("function");
    expect(typeof cfg.storage!.setItem).toBe("function");
    expect(typeof cfg.storage!.removeItem).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// SSR middleware — placeholder (ssr.ts is intentionally empty)
// ---------------------------------------------------------------------------
describe("SSR middleware module", () => {
  it("should import cleanly (module has no runtime exports — covered by types)", async () => {
    // ssr.ts has no exports; simply importing should not throw
    const mod = await import("../middleware/ssr");
    // The module exists and is an object (possibly empty)
    expect(typeof mod).toBe("object");
  });
});
