# @hua-labs/state Detailed Guide

`@hua-labs/state` wraps Zustand for React applications that need typed stores,
optional persistence, persistence-rehydration status, and a small i18n store
integration. It is useful when you want Zustand's direct store model but do not
want every application to repeat the same persistence glue.

---

## Installation

```bash
pnpm add @hua-labs/state zustand
```

React 19, React DOM 19, and Zustand 5 are peer dependencies.

## Create A Store

Use `createHuaStore` the same way you would define a Zustand store, then opt in
to persistence through the config object.

```tsx
import { createHuaStore } from "@hua-labs/state";

interface AppState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useAppStore = createHuaStore<AppState>(
  (set) => ({
    theme: "light",
    setTheme: (theme) => set({ theme }),
  }),
  {
    persist: true,
    persistKey: "app-storage",
    partialize: (state) => ({ theme: state.theme }),
  },
);
```

The `partialize` option is important for stores that contain temporary UI state,
functions, or large objects that should not be written to storage.

## Read From React

```tsx
function ThemeToggle() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme}
    </button>
  );
}
```

Use selectors to keep components subscribed only to the state they render.

## Persistence And Hydration

When `persist` is enabled, the store writes selected state to `localStorage`.
The `ssr` option is accepted for compatibility but currently has no runtime effect.
Do not use it as a server-rendering or hydration guarantee. Instead, use the
rehydration helpers below when UI must wait for Zustand persistence to finish.

The package exports helpers for hydration-sensitive UI. These helpers are keyed
by the store's `persistKey` string:

- `isStoreRehydrated(persistKey)` checks whether persisted state has completed
  its first rehydration pass.
- `onStoreRehydrated(persistKey, callback)` subscribes to hydration completion
  and returns an unsubscribe function.
- `markStoreRehydrated(persistKey)` is available for custom integrations that
  create stores outside `createHuaStore`.

```tsx
import { isStoreRehydrated, onStoreRehydrated } from "@hua-labs/state";

function waitForStore() {
  if (isStoreRehydrated("app-storage")) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const unsubscribe = onStoreRehydrated("app-storage", () => {
      unsubscribe();
      resolve();
    });
  });
}
```

## i18n Store Integration

The `@hua-labs/state/integrations/i18n` entry provides `createI18nStore` for
language selection state.

```tsx
import { createI18nStore } from "@hua-labs/state/integrations/i18n";

export const useI18nStore = createI18nStore({
  defaultLanguage: "en",
  supportedLanguages: ["en", "ko"],
  persistKey: "language",
});
```

Use this integration when the application needs a small language preference
store that can be shared with `@hua-labs/i18n-core-zustand`.

## Type Notes

`StoreCreator`, `StoreConfig`, `HuaStore`, `BaseStoreState`, `UseBoundStore`,
and `StoreApi` are exported for consumers that build reusable store factories.
Most application code only needs the hook returned by `createHuaStore`.

## Troubleshooting

If persisted values are missing after refresh, check that `persist` is enabled,
`persistKey` is stable, and `partialize` includes the field you expect.

If a component renders a server value before the client value appears, gate the
hydration-sensitive part of the UI on the rehydration helpers or render a
neutral placeholder until hydration completes.

If TypeScript loses store state inference, pass the state interface explicitly
to `createHuaStore<State>()` and keep the initializer return value aligned with
that interface.

---

## Scope

`@hua-labs/state` does not replace application architecture. Keep domain data,
server cache, routing state, and form libraries in their appropriate tools. Use
this package for compact client-side state that benefits from Zustand,
persistence, and explicit persistence-rehydration status.
