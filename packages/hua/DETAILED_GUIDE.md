# @hua-labs/hua — Detailed Guide

## Overview

`@hua-labs/hua` is a UX framework for React product teams, built on top of Next.js. Beyond UI components, it provides motion, loading UX, accessibility, branding, error handling, i18n, and state management — everything needed for complete user experience development.

One dependency. One config. Full UX stack.

---

## Package Composition & Tree-Shaking

`@hua-labs/hua` bundles 10 sub-packages. How you import them determines your bundle size.

### Why the Split?

```
import { Button, useTranslation } from '@hua-labs/hua';     // Main Entry — always in bundle
import { useDateFormatter } from '@hua-labs/hua/formatters'; // Subpath — tree-shaken if unused
import { i18nPlugin } from '@hua-labs/eslint-plugin-i18n';   // External — separate install
```

- **Main Entry**: The core UX primitives that almost every page uses (UI, motion, i18n, state). Included in the default bundle because excluding them provides negligible savings.
- **Subpath Imports**: Heavier or situational utilities (date/number formatting, translation loaders, specialized hooks). Behind subpath exports so bundlers can **tree-shake them entirely** when unused.
- **External Packages**: Dev-time tools (linter), domain-specific SDKs, or security-sensitive modules that shouldn't be auto-included.

### Main Entry (`import from '@hua-labs/hua'`)

The most frequently used packages. Every product page typically needs components, motion, and translations — so these are always available from the top-level import.

| Package | What You Get | Why Main Entry |
|---------|-------------|----------------|
| **@hua-labs/ui** | 100+ components | Every page renders UI |
| **@hua-labs/motion-core** | 15+ animation hooks | Most pages use transitions |
| **@hua-labs/i18n-core** | t, tPlural, tArray | Every text needs translation |
| **@hua-labs/i18n-core-zustand** | createZustandI18n | Wired into provider chain |
| **@hua-labs/state** | createStore, useStore | App-wide state management |
| **@hua-labs/pro** | Advanced motion hooks | Pro features for framework users |

### Subpath Imports (`import from '@hua-labs/hua/subpath'`)

Installed but **not in the default bundle**. Import only what you need — if you never import `/formatters`, zero bytes of formatting code ship to the client.

| Package | Subpath | When You Need It |
|---------|---------|-----------------|
| **@hua-labs/hooks** | `/hooks` | Scroll detection, mouse tracking, viewport resize |
| **@hua-labs/utils** | `/utils` | Utility functions (cn, merge) — often only in shared libs |
| **@hua-labs/i18n-formatters** | `/formatters` | Pages that display formatted dates, numbers, currencies |
| **@hua-labs/i18n-loaders** | `/loaders` | Custom translation loading strategies |

### Framework Layer (`@hua-labs/hua/framework`)

Unique to hua — not from any sub-package. The glue that wires everything together.

| Export | Type | Description |
|--------|------|-------------|
| `defineConfig` | function | Framework configuration with presets |
| `HuaProvider` | component | Root provider — auto-wires all systems |
| `HuaPage` | component | Page wrapper with motion, error boundary, vibe |
| `Button` / `Card` | component | Branded overrides (auto-apply branding colors) |
| `BrandingProvider` | component | CSS variable injection for brand theming |
| `useBranding` | hook | Access branding config |
| `useFocusManagement` | hook | WCAG focus management |
| `useFocusTrap` | hook | Modal focus trap |
| `SkipToContent` | component | WCAG skip-to-content link |
| `LiveRegion` | component | Screen reader announcements |
| `useDelayedLoading` | hook | Anti-flicker loading state |
| `SuspenseWrapper` | component | Suspense with fallback |
| `initLicense` / `hasLicense` | function | License system |
| `registerPlugin` | function | Plugin registration |

### External Packages (Separate Install)

Not included in `@hua-labs/hua`. Each has its own install and use case.

| Package | Purpose | Why External |
|---------|---------|-------------|
| @hua-labs/encryption | E2E encryption (AES-256-GCM) | Security-sensitive, opt-in only |
| @hua-labs/docs-engine | Documentation site engine | Docs-specific, not needed in products |
| @hua-labs/ui-dashboard | Dashboard components | Internal/pro-tier |
| @hua-labs/eslint-plugin-i18n | ESLint i18n rules | Dev-time only (devDependency) |
| @hua-labs/api-lite | API SDK | Domain-specific (my-app) |
| create-hua | CLI scaffolding | One-time project setup |

---

## Getting Started

### 1. Install

```bash
pnpm add @hua-labs/hua
```

### 2. Create Config

```tsx
// hua.config.ts
import { defineConfig } from '@hua-labs/hua/framework/config';

export default defineConfig({
  preset: 'product',
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en', 'ja'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
});
```

### 3. Add Provider

```tsx
// app/layout.tsx
import { HuaProvider } from '@hua-labs/hua/framework';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <HuaProvider>{children}</HuaProvider>
      </body>
    </html>
  );
}
```

### 4. Use in Pages

```tsx
// app/page.tsx
import { HuaPage } from '@hua-labs/hua/framework';
import { useTranslation } from '@hua-labs/hua/i18n';
import { Button } from '@hua-labs/hua';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <HuaPage vibe="clean" motion="fadeIn">
      <h1>{t('common:welcome')}</h1>
      <Button>Get Started</Button>
    </HuaPage>
  );
}
```

---

## Configuration

### Presets

| Preset | Use Case | Motion Style | Spacing | Icon Style |
|--------|----------|-------------|---------|------------|
| `product` | Product apps | Conservative (400ms) | Medium (8px) | Phosphor regular 20px |
| `marketing` | Landing pages | Dramatic (800-1000ms) | Extra-large (24px) | Phosphor bold 24px |

```tsx
// Minimal — preset handles everything
export default defineConfig({ preset: 'product' });

// Override specific settings
export default defineConfig({
  preset: 'product',
  i18n: { supportedLanguages: ['ko', 'en', 'ja'] },
  icons: { weight: 'light' },
});
```

### Full Config Schema

```typescript
interface HuaConfig {
  preset: 'product' | 'marketing';

  i18n: {
    defaultLanguage: string;       // Default: 'ko'
    supportedLanguages: string[];  // Default: ['ko', 'en']
    fallbackLanguage: string;      // Default: 'en'
    namespaces: string[];          // Default: ['common']
    translationLoader: 'api' | 'static';
    translationApiPath: string;    // Default: '/api/translations'
    languageStore?: ZustandStore;  // Custom Zustand store
  };

  icons: {
    set: 'phosphor' | 'iconsax';
    weight: string;                // Default: 'regular'
    size: number;                  // Default: 20
    color: string;                 // Default: 'currentColor'
  };

  motion: {
    defaultPreset: string;
    enableAnimations: boolean;     // Default: true
  };

  state: {
    persist: boolean;              // Default: true
    ssr: boolean;                  // Default: true
  };

  branding?: {
    colors?: { primary?, secondary?, accent?, success?, warning?, error?, info? };
    fonts?: { fontFamily?, fontSize? };
  };

  license?: {
    apiKey?: string;               // Or use HUA_LICENSE_KEY env
    type?: 'free' | 'pro' | 'enterprise';
  };

  plugins?: HuaPlugin[];
}
```

---

## Framework Layer

### HuaProvider

Root layout wrapper that auto-configures the provider chain:

```
<HuaProvider>
  └─ <BrandingProvider>        — CSS variable injection (SSR-safe)
       └─ <ToastProvider>      — Toast notifications
            └─ <IconProvider>  — Icon system (Phosphor/Iconsax)
                 └─ <I18nProvider>  — Translation system (Zustand)
                      └─ <ThemeInjector>  — Theme CSS variables
                           └─ <LanguageTransitionWrapper>
                                └─ {children}
```

Provider order matters: BrandingProvider is outermost so all child providers can access branding values.

### HuaPage

Page wrapper with built-in motion, error boundaries, and the vibe system:

```tsx
<HuaPage
  vibe="clean"              // 'clean' | 'fancy' | 'minimal'
  motion="fadeIn"           // 'fadeIn' | 'slideUp' | 'slideLeft' | 'scaleIn' | 'bounceIn'
  enableMotion={true}
  enableErrorBoundary={true}
  i18nKey="home"            // Auto-loads 'home' namespace
  seo={{ keywords: ['...'], ogImage: '...' }}
>
  {content}
</HuaPage>
```

**Vibe System:**

| Vibe | Duration | Style | Best For |
|------|----------|-------|----------|
| `clean` | 600ms | Spacing-focused, minimal interactions | Product pages |
| `fancy` | 800ms | Rich interactions, dramatic motion | Marketing, heroes |
| `minimal` | 300ms | Fast transitions, reduced motion | Settings, forms |

### Branded Components

`Button` and `Card` exported from main entry are branded overrides. When branding is configured, they auto-apply brand colors. Without branding, they work identically to originals.

```tsx
import { Button, Card } from '@hua-labs/hua';
// These auto-use branding.colors.primary when configured
```

---

## Import Paths

### Subpath Imports (Recommended for Production)

Subpath imports allow bundlers to split code into separate chunks. If a page doesn't import `/formatters`, that code never reaches the client.

```tsx
// Framework (server-compatible — no "use client")
import { defineConfig } from '@hua-labs/hua/framework/config';

// Framework (client)
import { HuaProvider, HuaPage } from '@hua-labs/hua/framework';

// Core packages — also available from main entry, but subpath is explicit
import { Button, Card, Modal } from '@hua-labs/hua/ui';
import { useFadeIn, useSlideUp } from '@hua-labs/hua/motion';
import { useTranslation } from '@hua-labs/hua/i18n';
import { createStore } from '@hua-labs/hua/state';

// Subpath-only packages — NOT in main entry, must use subpath
import { useDateFormatter } from '@hua-labs/hua/formatters';  // 0 bytes if unused
import { useInView, useMouse } from '@hua-labs/hua/hooks';    // 0 bytes if unused
import { cn, merge } from '@hua-labs/hua/utils';              // 0 bytes if unused
import { createApiLoader } from '@hua-labs/hua/loaders';      // 0 bytes if unused
```

### Main Entry (Quick Prototyping)

```tsx
// All core exports flat (300+) — convenient, but bundles everything from main entry
import { Button, useTranslation, useFadeIn } from '@hua-labs/hua';

// Note: subpath-only packages (formatters, hooks, utils, loaders) are never
// available from the main entry — you always need the subpath for those.
```

**When to use which:**

| Scenario | Use |
|----------|-----|
| Prototyping / playground | Main entry (`@hua-labs/hua`) |
| Production app | Subpath imports (`@hua-labs/hua/ui`, etc.) |
| Only need formatting on 1 page | `@hua-labs/hua/formatters` on that page only |
| Server components / middleware | `@hua-labs/hua/framework/config` or `/server` |

---

## Branding System

Inject custom brand colors and fonts via CSS variables:

```tsx
export default defineConfig({
  preset: 'product',
  branding: {
    colors: {
      primary: 'hsl(200, 80%, 50%)',
      secondary: 'hsl(200, 60%, 70%)',
      accent: 'hsl(40, 90%, 55%)',
    },
    fonts: {
      fontFamily: '"Pretendard", sans-serif',
    },
  },
});
```

**Access in components:**

```tsx
import { useBranding, useBrandingColor } from '@hua-labs/hua/framework';

function MyComponent() {
  const primary = useBrandingColor('primary', '#0ea5e9');
  return <div style={{ color: primary }}>Branded</div>;
}
```

**Default Theme (Teal):**
- Light: `hsl(166, 78%, 30%)`
- Dark: `hsl(166, 72%, 45%)`

---

## Accessibility

WCAG 2.1 compliant utilities:

```tsx
import {
  SkipToContent,
  useFocusTrap,
  LiveRegion,
  useLiveRegion,
} from '@hua-labs/hua/framework';

// Skip-to-content (add to layout)
<SkipToContent />

// Focus trap for modals
const trapRef = useRef(null);
const { activate, deactivate } = useFocusTrap(trapRef);

// Announce to screen readers
const { announce } = useLiveRegion();
announce('Item deleted successfully');
```

---

## Loading UX

Prevent loading flicker on fast connections:

```tsx
import {
  useDelayedLoading,
  SuspenseWrapper,
  withSuspense,
} from '@hua-labs/hua/framework';

// Only show spinner if loading takes > 200ms
const showSpinner = useDelayedLoading(isLoading, { delay: 200 });

// Suspense with fallback
<SuspenseWrapper fallback={<Skeleton />}>
  <LazyComponent />
</SuspenseWrapper>

// HOC
const LazyPage = withSuspense(lazy(() => import('./Page')), <Skeleton />);
```

---

## GEO (Generative Engine Optimization)

Optimize for AI search engines (ChatGPT, Perplexity, etc.):

```tsx
import { generateGEOMetadata } from '@hua-labs/hua/framework/shared';

export const metadata = generateGEOMetadata({
  title: 'Sum Diary',
  description: 'AI emotional diary app',
  keywords: ['diary', 'emotions', 'AI'],
});
```

---

## Plugin System

```typescript
import type { HuaPlugin } from '@hua-labs/hua/framework';

const analyticsPlugin: HuaPlugin = {
  name: 'analytics',
  version: '1.0.0',
  license: 'free',
  init(config) { /* setup */ },
  hooks: { useAnalytics: () => { /* ... */ } },
};

export default defineConfig({
  preset: 'product',
  plugins: [analyticsPlugin],
});
```

---

## License System

| Type | Included Features |
|------|-------------------|
| `free` | All core: UI, i18n, state, motion basics, a11y |
| `pro` | + Advanced motion hooks, premium components |
| `enterprise` | + Custom plugins, priority support |

```typescript
import { hasLicense, requireLicense } from '@hua-labs/hua/framework';

if (hasLicense('advanced-motion')) {
  // Pro features available
}
```

**Priority:** `HUA_LICENSE_KEY` env → `config.license` → default (free)

---

## Server Utilities

```tsx
// Server-compatible config (no "use client")
import { defineConfig } from '@hua-labs/hua/framework/config';

// Server-only utilities
import {
  createI18nMiddleware,
  generatePageMetadata,
} from '@hua-labs/hua/framework/server';

// Shared types (server + client)
import type { HuaConfig, HuaPlugin } from '@hua-labs/hua/framework/shared';
```

---

## Integration Strategies

### Strategy 1: Full Framework (Recommended)

Use hua as the single dependency. All packages wired automatically.

```tsx
// One config, one provider, done
import { defineConfig } from '@hua-labs/hua/framework/config';
import { HuaProvider } from '@hua-labs/hua/framework';
```

### Strategy 2: Modular (Advanced)

Use individual packages directly when hua's defaults don't fit.

```tsx
// Manual package selection
import { useTranslation } from '@hua-labs/i18n-core';
import { useFadeIn } from '@hua-labs/motion-core';
import { Button } from '@hua-labs/ui';
// No HuaProvider — wire providers manually
```

> Strategy 2 gives maximum control but requires manual provider setup. Most teams should use Strategy 1.
