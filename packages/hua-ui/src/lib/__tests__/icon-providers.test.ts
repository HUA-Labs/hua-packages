import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getIconsaxResolver,
  getIconProviderServerSnapshot,
  getIconProviderSnapshot,
  getLucideResolver,
  registerIconsaxResolver,
  registerLucideResolver,
  subscribeIconProvider,
} from "../icon-providers";

const REGISTRY_KEY = "__hua_icon_resolvers__";
const REGISTRY_TRUST_KEY = Symbol.for(
  "@hua-labs/ui/icon-resolver-registry-trust/v2",
);
const globalRegistry = globalThis as unknown as Record<string, unknown>;

function replaceGlobalRegistry(value: unknown): void {
  Object.defineProperty(globalRegistry, REGISTRY_KEY, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

function createForeignProviderState(
  resolver: (() => null) | null = null,
  version = 0,
  listeners: Set<() => void> = new Set(),
) {
  return { resolver, version, listeners };
}

function createForeignV2Registry() {
  return {
    schemaVersion: 2,
    lucide: createForeignProviderState(),
    iconsax: createForeignProviderState(),
  };
}

afterEach(() => {
  delete globalRegistry[REGISTRY_KEY];
  registerLucideResolver(null);
  registerIconsaxResolver(null);
});

describe("icon provider resolver lifecycle", () => {
  it("publishes provider-scoped monotonic snapshots with identity no-ops", () => {
    registerLucideResolver(null);
    registerIconsaxResolver(null);

    const lucideListener = vi.fn();
    const iconsaxListener = vi.fn();
    const unsubscribeLucide = subscribeIconProvider("lucide", lucideListener);
    const unsubscribeIconsax = subscribeIconProvider(
      "iconsax",
      iconsaxListener,
    );
    const lucideBefore = getIconProviderSnapshot("lucide");
    const iconsaxBefore = getIconProviderSnapshot("iconsax");
    const resolver = () => null;

    registerLucideResolver(resolver);

    expect(getLucideResolver()).toBe(resolver);
    expect(getIconProviderSnapshot("lucide")).toBe(lucideBefore + 1);
    expect(getIconProviderSnapshot("iconsax")).toBe(iconsaxBefore);
    expect(lucideListener).toHaveBeenCalledTimes(1);
    expect(iconsaxListener).not.toHaveBeenCalled();

    registerLucideResolver(resolver);
    expect(getIconProviderSnapshot("lucide")).toBe(lucideBefore + 1);
    expect(lucideListener).toHaveBeenCalledTimes(1);

    registerLucideResolver(null);
    expect(getIconProviderSnapshot("lucide")).toBe(lucideBefore + 2);
    expect(lucideListener).toHaveBeenCalledTimes(2);

    unsubscribeLucide();
    unsubscribeIconsax();
    registerLucideResolver(resolver);
    expect(lucideListener).toHaveBeenCalledTimes(2);
  });

  it("keeps the SSR snapshot stable across resolver mutations", () => {
    const before = getIconProviderServerSnapshot();
    registerLucideResolver(() => null);
    registerIconsaxResolver(() => null);

    expect(getIconProviderServerSnapshot()).toBe(before);
    expect(getIconProviderServerSnapshot()).toBe(0);
  });

  it("makes duplicate cleanup safe for StrictMode subscription lifetimes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeIconProvider("lucide", listener);

    unsubscribe();
    unsubscribe();
    registerLucideResolver(() => null);

    expect(listener).not.toHaveBeenCalled();
  });

  it("migrates the exact legacy resolver pair at version zero without notification", () => {
    const legacyLucide = vi.fn(() => null);
    const legacyIconsax = vi.fn(() => null);
    const legacyRegistry = {
      lucide: legacyLucide,
      iconsax: legacyIconsax,
    };
    replaceGlobalRegistry(legacyRegistry);

    expect(getLucideResolver()).toBe(legacyLucide);
    expect(getIconsaxResolver()).toBe(legacyIconsax);
    expect(globalRegistry[REGISTRY_KEY]).not.toBe(legacyRegistry);
    expect(getIconProviderSnapshot("lucide")).toBe(0);
    expect(getIconProviderSnapshot("iconsax")).toBe(0);
    expect(legacyLucide).not.toHaveBeenCalled();
    expect(legacyIconsax).not.toHaveBeenCalled();

    const lucideListener = vi.fn();
    const iconsaxListener = vi.fn();
    const unsubscribeLucide = subscribeIconProvider("lucide", lucideListener);
    const unsubscribeIconsax = subscribeIconProvider(
      "iconsax",
      iconsaxListener,
    );

    registerLucideResolver(legacyLucide);
    registerIconsaxResolver(legacyIconsax);

    expect(getIconProviderSnapshot("lucide")).toBe(0);
    expect(getIconProviderSnapshot("iconsax")).toBe(0);
    expect(lucideListener).not.toHaveBeenCalled();
    expect(iconsaxListener).not.toHaveBeenCalled();

    unsubscribeLucide();
    unsubscribeIconsax();
  });

  it("snapshots descriptor-safe outer and provider-state Proxies without consuming them raw", () => {
    for (const wrap of [
      (registry: ReturnType<typeof createForeignV2Registry>) =>
        new Proxy(registry, {
          get() {
            throw new Error("SECRET_OUTER_PROXY_GET");
          },
        }),
      (registry: ReturnType<typeof createForeignV2Registry>) => {
        registry.lucide = new Proxy(registry.lucide, {
          get() {
            throw new Error("SECRET_STATE_PROXY_GET");
          },
        });
        return registry;
      },
    ]) {
      const resolver = vi.fn(() => null);
      const listener = vi.fn();
      const foreign = createForeignV2Registry();
      foreign.lucide = createForeignProviderState(
        resolver,
        7,
        new Set([listener]),
      );
      const foreignState = foreign.lucide;
      const foreignListeners = foreignState.listeners;
      const wrapped = wrap(foreign);
      replaceGlobalRegistry(wrapped);

      expect(() => registerLucideResolver(resolver)).not.toThrow();
      expect(getLucideResolver()).toBe(resolver);
      expect(getIconProviderSnapshot("lucide")).toBe(7);
      expect(listener).not.toHaveBeenCalled();

      const replacement = vi.fn(() => null);
      expect(() => registerLucideResolver(replacement)).not.toThrow();
      expect(getLucideResolver()).toBe(replacement);
      expect(getIconProviderSnapshot("lucide")).toBe(8);
      expect(listener).toHaveBeenCalledTimes(1);

      const published = globalRegistry[REGISTRY_KEY] as typeof foreign;
      expect(Object.is(published, wrapped)).toBe(false);
      expect(Object.is(published.lucide, foreignState)).toBe(false);
      expect(Object.is(published.lucide.listeners, foreignListeners)).toBe(
        false,
      );
    }
  });

  it("fails closed on a Proxy-wrapped listener Set without leaking its raw exception", () => {
    const foreign = createForeignV2Registry();
    const listener = vi.fn();
    const rawListeners = new Set([listener]);
    const wrappedListeners = new Proxy(rawListeners, {});
    foreign.lucide = createForeignProviderState(
      vi.fn(() => null),
      7,
      wrappedListeners,
    );
    replaceGlobalRegistry(foreign);
    const resolver = vi.fn(() => null);

    expect(() => registerLucideResolver(resolver)).not.toThrow();
    expect(getLucideResolver()).toBe(resolver);
    expect(getIconsaxResolver()).toBeNull();
    expect(getIconProviderSnapshot("lucide")).toBe(1);
    expect(getIconProviderSnapshot("iconsax")).toBe(0);
    expect(listener).not.toHaveBeenCalled();

    const published = globalRegistry[REGISTRY_KEY] as typeof foreign;
    expect(Object.is(published, foreign)).toBe(false);
    expect(Object.is(published.lucide.listeners, wrappedListeners)).toBe(false);
  });

  it("does not accept forged process-global trust membership", () => {
    registerLucideResolver(null);
    const forged = new Proxy(createForeignV2Registry(), {
      get() {
        throw new Error("SECRET_FORGED_TRUST_REGISTRY");
      },
    });
    const trustDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      REGISTRY_TRUST_KEY,
    );
    if (trustDescriptor && "value" in trustDescriptor) {
      WeakSet.prototype.add.call(trustDescriptor.value, forged);
    } else {
      Object.defineProperty(globalThis, REGISTRY_TRUST_KEY, {
        value: new WeakSet([forged]),
        configurable: true,
      });
    }
    replaceGlobalRegistry(forged);
    const resolver = vi.fn(() => null);

    expect(() => registerLucideResolver(resolver)).not.toThrow();
    expect(getLucideResolver()).toBe(resolver);
    expect(getIconProviderSnapshot("lucide")).toBe(1);
    delete (globalThis as unknown as Record<PropertyKey, unknown>)[
      REGISTRY_TRUST_KEY
    ];
  });

  it("publishes immutable provider state slots that cannot be polluted", () => {
    const resolver = vi.fn(() => null);
    registerLucideResolver(resolver);
    const registry = globalRegistry[REGISTRY_KEY] as ReturnType<
      typeof createForeignV2Registry
    >;
    const state = registry.lucide;
    const originalListeners = state.listeners;
    const pollutedListeners = new Proxy(new Set<() => void>(), {});

    expect(Object.isFrozen(state)).toBe(true);
    expect(
      Reflect.set(
        state,
        "resolver",
        vi.fn(() => null),
      ),
    ).toBe(false);
    expect(Reflect.set(state, "version", 99)).toBe(false);
    expect(Reflect.set(state, "listeners", pollutedListeners)).toBe(false);
    expect(state.resolver).toBe(resolver);
    expect(state.version).toBe(1);
    expect(state.listeners).toStrictEqual(originalListeners);
    expect(Object.isFrozen(state.listeners)).toBe(true);

    const listener = vi.fn();
    expect(() => {
      const unsubscribe = subscribeIconProvider("lucide", listener);
      registerLucideResolver(null);
      unsubscribe();
    }).not.toThrow();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("preserves the valid shared registry when a subscribed listener throws", () => {
    const iconsaxResolver = vi.fn(() => null);
    const lucideResolver = vi.fn(() => null);
    const throwingListener = vi.fn(() => {
      throw new Error("SECRET_SUBSCRIBER_FAILURE");
    });
    const survivingListener = vi.fn();
    registerIconsaxResolver(iconsaxResolver);
    const unsubscribeThrowing = subscribeIconProvider(
      "lucide",
      throwingListener,
    );
    const unsubscribeSurviving = subscribeIconProvider(
      "lucide",
      survivingListener,
    );
    const registry = globalRegistry[REGISTRY_KEY];
    const iconsaxVersion = getIconProviderSnapshot("iconsax");

    expect(() => registerLucideResolver(lucideResolver)).not.toThrow();
    expect(globalRegistry[REGISTRY_KEY]).toBe(registry);
    expect(getLucideResolver()).toBe(lucideResolver);
    expect(getIconsaxResolver()).toBe(iconsaxResolver);
    expect(getIconProviderSnapshot("lucide")).toBe(1);
    expect(getIconProviderSnapshot("iconsax")).toBe(iconsaxVersion);
    expect(throwingListener).toHaveBeenCalledTimes(1);
    expect(survivingListener).toHaveBeenCalledTimes(1);

    unsubscribeThrowing();
    unsubscribeSurviving();
  });

  it("rejects invalid public JavaScript resolver input without resetting state", () => {
    const lucideResolver = vi.fn(() => null);
    const iconsaxResolver = vi.fn(() => null);
    registerLucideResolver(lucideResolver);
    registerIconsaxResolver(iconsaxResolver);
    const registry = globalRegistry[REGISTRY_KEY];
    const lucideVersion = getIconProviderSnapshot("lucide");
    const iconsaxVersion = getIconProviderSnapshot("iconsax");

    expect(() =>
      (registerLucideResolver as (resolver: unknown) => void)("invalid"),
    ).not.toThrow();
    expect(globalRegistry[REGISTRY_KEY]).toBe(registry);
    expect(getLucideResolver()).toBe(lucideResolver);
    expect(getIconsaxResolver()).toBe(iconsaxResolver);
    expect(getIconProviderSnapshot("lucide")).toBe(lucideVersion);
    expect(getIconProviderSnapshot("iconsax")).toBe(iconsaxVersion);
  });

  it("rejects malformed and foreign global registry values without invoking accessors", () => {
    const legacyResolver = vi.fn(() => null);
    const accessor = vi.fn(() => legacyResolver);
    const accessorRecord = Object.defineProperties(
      {},
      {
        lucide: { get: accessor, enumerable: true },
        iconsax: { value: null, enumerable: true },
      },
    );
    const nullPrototypeRecord = Object.assign(Object.create(null), {
      lucide: legacyResolver,
      iconsax: null,
    });
    const symbolRecord = {
      lucide: legacyResolver,
      iconsax: null,
      [Symbol("foreign")]: true,
    };
    const throwingProxy = new Proxy(
      {},
      {
        get() {
          throw new Error("SECRET_FOREIGN_REGISTRY");
        },
        ownKeys() {
          throw new Error("SECRET_FOREIGN_REGISTRY");
        },
      },
    );

    for (const malformed of [
      null,
      [],
      { lucide: legacyResolver },
      { lucide: legacyResolver, iconsax: null, extra: true },
      { lucide: "not-a-function", iconsax: null },
      { schemaVersion: 2, lucide: null, iconsax: null },
      accessorRecord,
      nullPrototypeRecord,
      symbolRecord,
      throwingProxy,
    ]) {
      replaceGlobalRegistry(malformed);

      expect(() => getLucideResolver()).not.toThrow();
      expect(getLucideResolver()).toBeNull();
      expect(getIconsaxResolver()).toBeNull();
      expect(getIconProviderSnapshot("lucide")).toBe(0);
      expect(getIconProviderSnapshot("iconsax")).toBe(0);
    }

    expect(accessor).not.toHaveBeenCalled();
  });
});
