# i18n Library Comparison: @hua-labs/i18n-core vs Existing Solutions

## 📊 Feature Comparison Table

| Feature | @hua-labs/i18n-core | i18next | next-intl | react-i18next | lingui |
|------|---------------------|---------|-----------|----------------|--------|
| **SSR/CSR Support** | ✅ | ⚠️ | ✅ | ⚠️ | ✅ |
| **Hydration Issue Resolution** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Flickering Prevention on Language Change** | ✅ | ❌ | ⚠️ | ❌ | ⚠️ |
| **State Management Integration (Zustand)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Type Safety** | ⚠️ (Basic) | ⚠️ | ✅ | ⚠️ | ✅ |
| **Translation Key Autocomplete** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Tree Shaking** | ✅ | ⚠️ | ✅ | ⚠️ | ✅ |
| **Zero Dependencies** | ✅ (React only) | ❌ | ❌ | ❌ | ❌ |
| **Bundle Size** | ~9.5KB (main, ~2.8KB gzip) | ~15KB | ~12KB | ~18KB | ~10KB |
| **Framework Agnostic** | ✅ | ✅ | ❌ (Next.js) | ✅ | ✅ |
| **Adapter Pattern** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **L2 Cache (IndexedDB)** | ❌ (Planned) | ❌ | ❌ | ❌ | ❌ |
| **Pluralization** | ❌ (Higher package) | ✅ | ✅ | ✅ | ✅ |
| **Date/Time Formatting** | ❌ (Higher package) | ✅ | ✅ | ✅ | ✅ |
| **RTL Support** | ❌ (Higher package) | ✅ | ✅ | ✅ | ✅ |

## 🎯 Key Differentiators

### 1. SSR/CSR Support

**@hua-labs/i18n-core:**
```typescript
// Pass initial translations from SSR
const ssrTranslations = await loadSSRTranslations('ko');
const initialTranslations = {
  ko: { common: ssrTranslations.ko?.common || {} },
  en: { common: ssrTranslations.en?.common || {} }
};

// Use initialTranslations to resolve hydration issues
<I18nProvider initialTranslations={initialTranslations}>
  {children}
</I18nProvider>
```

**i18next:**
- Supports SSR but hydration mismatch issues may occur
- Flickering may occur when reloading on client

### 2. Flickering Prevention on Language Change

**@hua-labs/i18n-core:**
```typescript
// Automatically shows previous language translation temporarily
translate(key: string): string {
  // Try current language first
  let result = findInNamespace(namespace, key, targetLang);
  
  // If not found, try previous language (prevent flickering)
  if (!result && this.allTranslations) {
    for (const lang of Object.keys(this.allTranslations)) {
      if (lang !== targetLang) {
        result = findInNamespace(namespace, key, lang);
        if (result) return result; // Temporarily show previous language
      }
    }
  }
  
  return result || '';
}
```

**Other libraries:**
- Empty strings or keys may be briefly exposed during language changes
- Users may experience flickering

### 3. State Management Integration

**@hua-labs/i18n-core:**
```typescript
// Fully integrated with Zustand
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';

const I18nProvider = createZustandI18n(useAppStore, {
  defaultLanguage: 'ko',
  // Automatically syncs with Zustand store
});
```

**Other libraries:**
- Often managed separately from state management
- Manual synchronization may be required
- Type safety may be limited

### 4. Adapter Pattern

**@hua-labs/i18n-core:**
- Core is framework-agnostic
- Can integrate with Zustand, Redux, etc. via adapters
- Can be swapped as needed

**Other libraries:**
- Tied to specific frameworks
- Limited extensibility

## 💡 When to Use @hua-labs/i18n-core?

### ✅ Recommended Cases

1. **Using Next.js App Router**
   - SSR/CSR support
   - Need to resolve hydration issues

2. **Using Zustand**
   - Need to integrate state management with i18n
   - Want type-safe integration

3. **Bundle Size Matters**
   - Zero dependencies (React only)
   - Tree shaking support

4. **UX Quality Priority**
   - Want to minimize flickering on language changes
   - Want to prevent key exposure during initial loading

5. **Framework Independence Needed**
   - Use across Next.js, Remix, Vite, etc.
   - Extensible via adapter pattern

### ❌ Consider Other Libraries If

1. **Pluralization, Date/Time Formatting Needed Immediately**
   - Currently planned for higher-level packages
   - Consider lingui or next-intl if needed immediately

2. **Translation Key Autocomplete Required**
   - Currently no type inference tool
   - Consider next-intl if type inference is needed

3. **Large Community Required**
   - Still in early stage
   - Consider i18next if proven solution is needed

## 🚀 Roadmap

### v0.x (Current)
- ✅ SSR/CSR support
- ✅ Zustand integration
- ✅ Flickering prevention on language change
- ✅ Tree shaking support

### v1.0 (Planned)
- [ ] L2 cache (IndexedDB)
- [ ] Translation key type inference
- [ ] User preferred language preloading
- [ ] Example projects

### v2.0 (Planned)
- [ ] Pluralization support (higher package)
- [ ] Date/time formatting (higher package)
- [ ] RTL support (higher package)
- [ ] Message fallback chain
