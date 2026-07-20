/**
 * Icon provider resolver lifecycle.
 *
 * Semantic names and provider bindings live in icon-catalog.ts. This module
 * keeps the existing global resolver lifecycle and exposes compatibility
 * projections without guessing provider component names.
 */

import type { ComponentType } from "react";
import {
  ICON_CATALOG,
  LEGACY_PROJECT_ICON_NAMES,
  getIconProviderComponent,
  type IconProviderName,
  type LegacyProjectIconName,
} from "./icon-catalog";

// ── Global Resolver Registry ────────────────────────────────────
// globalThis registry preserves resolver sharing across split package entries.
const REGISTRY_KEY = "__hua_icon_resolvers__";
const REGISTRY_SCHEMA_VERSION = 2;
const SERVER_SNAPSHOT = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LucideResolver = ((name: string) => any) | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconsaxResolver = ((name: string, variant?: string) => any) | null;
type ProviderResolver = LucideResolver | IconsaxResolver;

type ProviderListener = () => void;

interface MutableIconProviderResolverState<Resolver extends ProviderResolver> {
  resolver: Resolver;
  version: number;
  listeners: Set<ProviderListener>;
}

interface IconProviderResolverFacade<Resolver extends ProviderResolver> {
  readonly resolver: Resolver;
  readonly version: number;
  readonly listeners: readonly ProviderListener[];
}

interface IconResolverRegistry {
  schemaVersion: typeof REGISTRY_SCHEMA_VERSION;
  lucide: IconProviderResolverFacade<LucideResolver>;
  iconsax: IconProviderResolverFacade<IconsaxResolver>;
  getResolver(
    provider: Exclude<IconProviderName, "phosphor">,
  ): ProviderResolver;
  getVersion(provider: Exclude<IconProviderName, "phosphor">): number;
  setResolver(
    provider: Exclude<IconProviderName, "phosphor">,
    resolver: ProviderResolver,
  ): void;
  addListener(
    provider: Exclude<IconProviderName, "phosphor">,
    listener: ProviderListener,
  ): void;
  deleteListener(
    provider: Exclude<IconProviderName, "phosphor">,
    listener: ProviderListener,
  ): void;
}

function createProviderState<Resolver extends ProviderResolver>(
  resolver: Resolver,
  version = 0,
  listeners: Set<ProviderListener> = new Set(),
): MutableIconProviderResolverState<Resolver> {
  return { resolver, version, listeners };
}

function createProviderFacade<Resolver extends ProviderResolver>(
  state: MutableIconProviderResolverState<Resolver>,
): IconProviderResolverFacade<Resolver> {
  const facade = Object.defineProperties(
    {},
    {
      resolver: {
        get: () => state.resolver,
        enumerable: true,
      },
      version: {
        get: () => state.version,
        enumerable: true,
      },
      listeners: {
        get: () => Object.freeze([...state.listeners]),
        enumerable: true,
      },
    },
  );
  return Object.freeze(facade) as IconProviderResolverFacade<Resolver>;
}

function selectProviderState(
  provider: Exclude<IconProviderName, "phosphor">,
  lucide: MutableIconProviderResolverState<LucideResolver>,
  iconsax: MutableIconProviderResolverState<IconsaxResolver>,
): MutableIconProviderResolverState<ProviderResolver> {
  if (provider === "lucide") return lucide;
  if (provider === "iconsax") return iconsax;
  throw new TypeError("invalid-icon-provider");
}

function notifyProviderListeners(
  state: MutableIconProviderResolverState<ProviderResolver>,
): void {
  for (const listener of [...state.listeners]) {
    try {
      listener();
    } catch {
      // A subscriber is observational. Its exception cannot roll back or
      // invalidate a provider registration that already committed.
    }
  }
}

function createRegistryFromStates(
  lucide: MutableIconProviderResolverState<LucideResolver>,
  iconsax: MutableIconProviderResolverState<IconsaxResolver>,
): IconResolverRegistry {
  const getState = (provider: Exclude<IconProviderName, "phosphor">) =>
    selectProviderState(provider, lucide, iconsax);
  const registry = Object.freeze({
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    lucide: createProviderFacade(lucide),
    iconsax: createProviderFacade(iconsax),
    getResolver: (provider: Exclude<IconProviderName, "phosphor">) =>
      getState(provider).resolver,
    getVersion: (provider: Exclude<IconProviderName, "phosphor">) =>
      getState(provider).version,
    setResolver: (
      provider: Exclude<IconProviderName, "phosphor">,
      resolver: ProviderResolver,
    ) => {
      if (resolver !== null && !isResolver(resolver)) {
        throw new TypeError("invalid-icon-resolver");
      }
      const state = getState(provider);
      if (Object.is(state.resolver, resolver)) return;
      state.resolver = resolver;
      state.version += 1;
      notifyProviderListeners(state);
    },
    addListener: (
      provider: Exclude<IconProviderName, "phosphor">,
      listener: ProviderListener,
    ) => {
      if (typeof listener !== "function") {
        throw new TypeError("invalid-icon-provider-listener");
      }
      Set.prototype.add.call(getState(provider).listeners, listener);
    },
    deleteListener: (
      provider: Exclude<IconProviderName, "phosphor">,
      listener: ProviderListener,
    ) => {
      Set.prototype.delete.call(getState(provider).listeners, listener);
    },
  });
  return registry;
}

function createRegistry(
  lucide: LucideResolver = null,
  iconsax: IconsaxResolver = null,
): IconResolverRegistry {
  return createRegistryFromStates(
    createProviderState(lucide),
    createProviderState(iconsax),
  );
}

function readExactPlainDataRecord(
  value: unknown,
  expectedKeys: readonly string[],
): Readonly<Record<string, unknown>> | null {
  if (typeof value !== "object" || value === null) return null;

  try {
    if (Object.getPrototypeOf(value) !== Object.prototype) return null;
    const ownKeys = Reflect.ownKeys(value);
    if (
      ownKeys.length !== expectedKeys.length ||
      ownKeys.some(
        (key) =>
          typeof key !== "string" ||
          !(expectedKeys as readonly string[]).includes(key),
      )
    ) {
      return null;
    }

    const record: Record<string, unknown> = Object.create(null);
    for (const key of expectedKeys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
        return null;
      }
      record[key] = descriptor.value;
    }
    return record;
  } catch {
    return null;
  }
}

function isResolver(value: unknown): value is Exclude<ProviderResolver, null> {
  return typeof value === "function";
}

function isOptionalProvider(
  value: unknown,
): value is Exclude<IconProviderName, "phosphor"> {
  return value === "lucide" || value === "iconsax";
}

function readExactListenerSet(value: unknown): Set<() => void> | null {
  if (typeof value !== "object" || value === null) return null;

  try {
    if (
      Object.getPrototypeOf(value) !== Set.prototype ||
      Reflect.ownKeys(value).length !== 0
    ) {
      return null;
    }

    const listeners = new Set<() => void>();
    let valid = true;
    Set.prototype.forEach.call(value, (listener: unknown) => {
      if (typeof listener !== "function") {
        valid = false;
        return;
      }
      Set.prototype.add.call(listeners, listener);
    });
    return valid ? listeners : null;
  } catch {
    return null;
  }
}

function readCurrentProviderState(
  value: unknown,
): MutableIconProviderResolverState<ProviderResolver> | null {
  const record = readExactPlainDataRecord(value, [
    "resolver",
    "version",
    "listeners",
  ]);
  if (!record) return null;

  const listeners = readExactListenerSet(record.listeners);
  if (
    (record.resolver !== null && !isResolver(record.resolver)) ||
    !Number.isSafeInteger(record.version) ||
    (record.version as number) < 0 ||
    !listeners
  ) {
    return null;
  }
  return createProviderState(
    record.resolver as ProviderResolver,
    record.version as number,
    listeners,
  );
}

function readCurrentRegistry(value: unknown): IconResolverRegistry | null {
  const record = readExactPlainDataRecord(value, [
    "schemaVersion",
    "lucide",
    "iconsax",
  ]);
  if (!record || record.schemaVersion !== REGISTRY_SCHEMA_VERSION) return null;

  const lucide = readCurrentProviderState(record.lucide);
  const iconsax = readCurrentProviderState(record.iconsax);
  if (!lucide || !iconsax) return null;

  return createRegistryFromStates(
    lucide as MutableIconProviderResolverState<LucideResolver>,
    iconsax as MutableIconProviderResolverState<IconsaxResolver>,
  );
}

function isFrozenProviderFacade(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;

  try {
    if (
      Object.getPrototypeOf(value) !== Object.prototype ||
      !Object.isFrozen(value)
    ) {
      return false;
    }
    const ownKeys = Reflect.ownKeys(value);
    const expectedKeys = ["resolver", "version", "listeners"] as const;
    if (
      ownKeys.length !== expectedKeys.length ||
      ownKeys.some(
        (key) =>
          typeof key !== "string" ||
          !(expectedKeys as readonly string[]).includes(key),
      )
    ) {
      return false;
    }
    return expectedKeys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return (
        descriptor !== undefined &&
        !("value" in descriptor) &&
        typeof descriptor.get === "function" &&
        descriptor.set === undefined &&
        descriptor.enumerable === true &&
        descriptor.configurable === false
      );
    });
  } catch {
    return false;
  }
}

function isPublishedRegistry(value: unknown): value is IconResolverRegistry {
  const record = readExactPlainDataRecord(value, [
    "schemaVersion",
    "lucide",
    "iconsax",
    "getResolver",
    "getVersion",
    "setResolver",
    "addListener",
    "deleteListener",
  ]);
  if (!record) return false;

  try {
    return (
      Object.isFrozen(value) &&
      record.schemaVersion === REGISTRY_SCHEMA_VERSION &&
      isFrozenProviderFacade(record.lucide) &&
      isFrozenProviderFacade(record.iconsax) &&
      typeof record.getResolver === "function" &&
      typeof record.getVersion === "function" &&
      typeof record.setResolver === "function" &&
      typeof record.addListener === "function" &&
      typeof record.deleteListener === "function"
    );
  } catch {
    return false;
  }
}

function readLegacyRegistry(
  value: unknown,
): { lucide: LucideResolver; iconsax: IconsaxResolver } | null {
  const record = readExactPlainDataRecord(value, ["lucide", "iconsax"]);
  if (
    !record ||
    (record.lucide !== null && !isResolver(record.lucide)) ||
    (record.iconsax !== null && !isResolver(record.iconsax))
  ) {
    return null;
  }
  return {
    lucide: record.lucide as LucideResolver,
    iconsax: record.iconsax as IconsaxResolver,
  };
}

function readGlobalRegistry(): unknown {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      REGISTRY_KEY,
    );
    return descriptor && "value" in descriptor ? descriptor.value : undefined;
  } catch {
    return undefined;
  }
}

function publishGlobalRegistry(registry: IconResolverRegistry): void {
  try {
    Object.defineProperty(globalThis, REGISTRY_KEY, {
      value: registry,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch {
    // A malformed non-configurable foreign global remains isolated. The fresh
    // registry returned by getRegistry still fails closed for this call.
  }
}

function getRegistry(): IconResolverRegistry {
  const current = readGlobalRegistry();
  if (isPublishedRegistry(current)) return current;

  const currentSnapshot = readCurrentRegistry(current);
  if (currentSnapshot) {
    publishGlobalRegistry(currentSnapshot);
    return currentSnapshot;
  }

  const legacy = readLegacyRegistry(current);
  const registry = legacy
    ? createRegistry(legacy.lucide, legacy.iconsax)
    : createRegistry();
  publishGlobalRegistry(registry);
  return registry;
}

function recoverRegistry(): IconResolverRegistry {
  const registry = createRegistry();
  publishGlobalRegistry(registry);
  return registry;
}

function runRegistryOperation<Result>(
  operation: (registry: IconResolverRegistry) => Result,
  fallback: Result,
): Result {
  try {
    return operation(getRegistry());
  } catch {
    try {
      return operation(recoverRegistry());
    } catch {
      return fallback;
    }
  }
}

/** Register a Lucide resolver (called from app-level setup). */
export function registerLucideResolver(resolver: LucideResolver): void {
  if (resolver !== null && !isResolver(resolver)) return;
  runRegistryOperation((registry) => {
    registry.setResolver("lucide", resolver);
  }, undefined);
}

/** Get the registered Lucide resolver. */
export function getLucideResolver(): LucideResolver {
  return runRegistryOperation((registry) => {
    const resolver = registry.getResolver("lucide");
    return resolver === null || isResolver(resolver) ? resolver : null;
  }, null) as LucideResolver;
}

/** Register the Iconsax resolver from the optional Iconsax entry. */
export function registerIconsaxResolver(resolver: IconsaxResolver): void {
  if (resolver !== null && !isResolver(resolver)) return;
  runRegistryOperation((registry) => {
    registry.setResolver("iconsax", resolver);
  }, undefined);
}

/** Get the registered Iconsax resolver. */
export function getIconsaxResolver(): IconsaxResolver {
  return runRegistryOperation((registry) => {
    const resolver = registry.getResolver("iconsax");
    return resolver === null || isResolver(resolver) ? resolver : null;
  }, null) as IconsaxResolver;
}

/** Subscribe only to the selected optional provider resolver. */
export function subscribeIconProvider(
  provider: IconProviderName,
  listener: () => void,
): () => void {
  if (!isOptionalProvider(provider) || typeof listener !== "function") {
    return () => {};
  }
  runRegistryOperation((registry) => {
    registry.addListener(provider, listener);
  }, undefined);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    runRegistryOperation((registry) => {
      registry.deleteListener(provider, listener);
    }, undefined);
  };
}

/** Return the selected provider's monotonic client snapshot. */
export function getIconProviderSnapshot(provider: IconProviderName): number {
  if (!isOptionalProvider(provider)) return 0;
  return runRegistryOperation((registry) => {
    const version = registry.getVersion(provider);
    return Number.isSafeInteger(version) && version >= 0 ? version : 0;
  }, 0);
}

/** Stable server snapshot used by React hydration. */
export function getIconProviderServerSnapshot(): number {
  return SERVER_SNAPSHOT;
}

export type IconProvider = IconProviderName;

export interface IconProviderConfig {
  provider: IconProvider;
  prefix?: string;
}

export interface ProjectIconProviderMapping {
  readonly lucide: string;
  readonly phosphor: string;
  readonly iconsax?: string;
}

/**
 * Compatibility projection of the 125 historical PROJECT_ICONS spellings.
 *
 * The semantic catalog is the sole authored list. Unsupported optional
 * providers are omitted rather than guessed.
 */
export const PROJECT_ICONS = Object.freeze(
  Object.fromEntries(
    LEGACY_PROJECT_ICON_NAMES.map((name) => {
      const record = ICON_CATALOG.find((candidate) =>
        (candidate.projectSpellings as readonly string[]).includes(name),
      );
      if (!record) {
        throw new Error(`Missing catalog record for legacy icon ${name}`);
      }

      const lucideComponent = record.providers.lucide.component;
      const phosphorComponent = record.providers.phosphor.component;
      if (lucideComponent === null || phosphorComponent === null) {
        throw new Error(`Legacy icon ${name} is missing a required provider`);
      }

      const mapping: {
        lucide: string;
        phosphor: string;
        iconsax?: string;
      } = {
        lucide: lucideComponent,
        phosphor: phosphorComponent,
      };
      if (record.providers.iconsax.component !== null) {
        mapping.iconsax = record.providers.iconsax.component;
      }
      return [name, Object.freeze(mapping)] as const;
    }),
  ),
) as Readonly<Record<LegacyProjectIconName, ProjectIconProviderMapping>>;

/**
 * Resolve an optional provider component through the existing resolver
 * lifecycle. Unsupported and unknown catalog mappings return null.
 */
export function getIconFromProvider(
  iconName: string,
  provider: IconProvider = "phosphor",
): ComponentType<Record<string, unknown>> | null {
  const componentName = getIconProviderComponent(iconName, provider);
  if (componentName === null || provider === "phosphor") return null;

  if (provider === "lucide") {
    return getLucideResolver()?.(componentName) ?? null;
  }
  return getIconsaxResolver()?.(componentName) ?? null;
}

/** Return the exact catalog component name, or null when unsupported. */
export function getIconNameForProvider(
  iconName: string,
  provider: IconProvider,
): string | null {
  return getIconProviderComponent(iconName, provider);
}

/** Return the exact historical PROJECT_ICONS spelling inventory. */
export function getProjectIconNames(): string[] {
  return [...LEGACY_PROJECT_ICON_NAMES];
}
