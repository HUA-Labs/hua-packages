# @hua-labs/state Detailed Guide

State management solution for the HUA UX ecosystem.

---

## Core Implementation

@hua-labs/state is built using Zustand, providing pre-integrated middlewares for common application requirements such as SSR hydration and localStorage persistence.

## Technical Utilities

### 1. createHuaStore

Extends the standard Zustand creator with persistence and SSR compensation logic.

```tsx
const useStore = createHuaStore((set) => ({ ... }), {
  persist: true,
  persistKey: 'state-storage',
  ssr: true,
  partialize: (state) => ({ theme: state.theme })
});
```

### 2. createI18nStore

Dedicated store for managing internationalization states, including current language, support list, and initialization status.

---

## Integration Technicalities

Serves as the internal state orchestration layer between `@hua-labs/state` and `@hua-labs/i18n-core-zustand`.
