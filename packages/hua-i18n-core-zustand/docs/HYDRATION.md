# Hydration Guide

## Overview

`@hua-labs/i18n-core-zustand` is an adapter that integrates Zustand store with i18n-core. It provides an optimized synchronization mechanism to prevent hydration errors in SSR environments.

## Hydration Process

### 1. Initialization Phase

```typescript
// Set initial language in SSR
const I18nProvider = createZustandI18n(useAppStore, {
  defaultLanguage: 'ko',  // Same initial language as SSR
  // ...
});
```

**Important**: `defaultLanguage` must match the initial language used in SSR. This ensures server and client initial rendering match, preventing hydration errors.

### 2. Hydration Completion Detection

When the browser is ready, hydration is considered complete:

```typescript
// When browser is ready, consider hydration complete
const timeoutId = setTimeout(() => {
  requestAnimationFrame(checkHydration);
}, 0);
```

### 3. Language Synchronization

Only after hydration is complete, synchronize Zustand store language to i18n:

```typescript
// Synchronize stored language after hydration completes
if (isInitialized && hydrationComplete) {
  const storeLanguage = store.getState().language;
  if (storeLanguage !== initialLanguage) {
    setI18nLanguage(storeLanguage);
  }
}
```

## Language Change Flow

### Unidirectional Data Flow

Zustand store is the single source of truth for language state:

```
Zustand Store (language change)
    ↓
Adapter detects change
    ↓
Synchronize to i18n-core
    ↓
Translation updates
```

### Infinite Loop Prevention

To prevent infinite loops during language synchronization:

1. **Previous language tracking**: Tracks previous language with `previousStoreLanguage`
2. **Conditional synchronization**: Only synchronizes when different from current i18n language
3. **Hydration completion check**: Only synchronizes after hydration is complete

```typescript
// Prevent infinite loop
if (newLanguage !== state.currentI18nLanguage) {
  setI18nLanguage(newLanguage);
}
```

## Hydration State Management

### State Structure

```typescript
interface HydrationState {
  isComplete: boolean;           // Hydration completion status
  isInitialized: boolean;         // i18n initialization status
  previousStoreLanguage: string | null;  // Previous store language
  currentI18nLanguage: string;    // Current i18n language
}
```

### State Update Timing

1. **Hydration complete**: `isComplete = true` when browser is ready
2. **i18n initialization**: `isInitialized = true` when Translator initialization completes
3. **Language change**: State updates whenever language changes

## Debug Mode

Enable debug mode to track the hydration process:

```typescript
const I18nProvider = createZustandI18n(useAppStore, {
  debug: true,
  // ...
});
```

### Debug Log Examples

```
[ZUSTAND-I18N] Hydration complete
[ZUSTAND-I18N] Hydration complete, syncing language: ko -> en
[ZUSTAND-I18N] Store language changed, syncing to i18n: en -> ko
[ZUSTAND-I18N] Store language changed but i18n already synced: ko
```

## Important Notes

### 1. SSR Initial Language Match

SSR and client initial languages must match:

```typescript
// Correct example
// Server: defaultLanguage = 'ko'
// Client: defaultLanguage = 'ko'

// Incorrect example
// Server: defaultLanguage = 'ko'
// Client: defaultLanguage = 'en'  // Hydration error occurs
```

### 2. Language Change Timing

Language changes must be performed through Zustand store:

```typescript
// Correct example
const { setLanguage } = useAppStore();
setLanguage('en');

// Incorrect example
const { setLanguage } = useTranslation();
setLanguage('en');  // Not synchronized with Zustand store
```

### 3. Language Change Before Hydration Complete

If language is changed before hydration completes, synchronization may be delayed:

```typescript
// Language changes before hydration complete are queued
// Automatically synchronized after completion
```

## Troubleshooting

### Hydration Error Occurs

1. **Check initial language**: Verify that SSR and client `defaultLanguage` match
2. **Check store structure**: Verify Zustand store has `language` and `setLanguage`
3. **Enable debug mode**: Check debug logs to track synchronization process

### Language Not Synchronizing

1. **Check hydration completion**: Check debug logs for hydration complete message
2. **Check store subscription**: Verify Zustand store changes are detected
3. **Check infinite loop**: Check debug logs for infinite loop related messages
