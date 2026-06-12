# @hua-labs/hua

Batteries-included framework for React product teams. Unifies UI components, animation hooks, internationalization, state management, and utilities into a single dependency with automatic provider setup for Next.js.

[![npm version](https://img.shields.io/npm/v/@hua-labs/hua.svg)](https://www.npmjs.com/package/@hua-labs/hua)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/hua.svg)](https://www.npmjs.com/package/@hua-labs/hua)
[![license](https://img.shields.io/npm/l/@hua-labs/hua.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **Pre-wired — UI, motion, i18n, state configured and ready to use**
- **Framework layer — Next.js-optimized with defineConfig and automatic providers**
- **Re-exports 290+ symbols — UI (100+ components), motion-core (40+ hooks), i18n, state, pro**
- **Accessibility — WCAG 2.1 compliant utilities (focus management, skip-to-content)**
- **Loading UX — Built-in delayed loading, suspense wrappers**
- **Error handling — ErrorBoundary built into HuaPage**
- **White-labeling — SSR-compatible CSS variable injection via branding config**
- **GEO support — Generative Engine Optimization for AI search engines**
- **License system — Runtime feature gating with initLicense / requireLicense**
- **Plugin system — Register and retrieve runtime plugins via pluginRegistry**

## Installation

```bash
pnpm add @hua-labs/hua
```

> Peer dependencies: next >=13.0.0, react >=19.0.0, react-dom >=19.0.0, server-only ^0.0.1

## Quick Start

```tsx
// hua.config.ts
import { defineConfig } from '@hua-labs/hua/framework/config';

export default defineConfig({
  preset: 'product',
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
});

// app/layout.tsx
import { HuaProvider } from '@hua-labs/hua/framework';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <HuaProvider>{children}</HuaProvider>
      </body>
    </html>
  );
}

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `Button` | component | BrandedButton re-exported as Button — auto-applies branding primary/secondary/accent CSS variables when branding is configured. Falls back to @hua-labs/ui Button when no branding. |
| `Card` | component | BrandedCard re-exported as Card — auto-applies branding CSS variables when branding is configured. Falls back to @hua-labs/ui Card when no branding. |
| `usePresetMotion` | hook | Convenience hook that resolves per-role motion config from the active preset and combines it with reducedMotion / enableAnimations global flags. Returns { config: ComponentMotionConfig | undefined, shouldAnimate: boolean }. |
| `defineConfig` | function | Define hua configuration with presets (product, landing, docs). Available presets: 'product' | 'landing' | 'docs'. Import from '@hua-labs/hua/framework/config'. |
| `HuaProvider` | component | Root layout provider — injects Tailwind v4 CSS theme variables at runtime, auto-wires BrandingProvider, ToastProvider, IconProvider, MotionConfigProvider, and i18n. Import from '@hua-labs/hua/framework'. |
| `HuaPage` | component | Page wrapper with automatic motion (vibe prop: 'clean' | 'fancy' | 'minimal'), ErrorBoundary, and i18nKey namespace hint. Import from '@hua-labs/hua/framework'. |
| `BrandedButton` | component | Lower-level branded button (same as Button export). Use the Button export from '@hua-labs/hua' or import BrandedButton from '@hua-labs/hua/framework' directly. |
| `BrandedCard` | component | Lower-level branded card (same as Card export). Use the Card export from '@hua-labs/hua' or import BrandedCard from '@hua-labs/hua/framework' directly. |
| `WelcomePage` | component | Default welcome page for new hua projects. Renders project name, framework feature cards, and quick links with fade/slide animations. Accepts projectName, showFeatures, showQuickLinks props. |
| `UnifiedProviders` | component | Lower-level provider composition component used internally by HuaProvider. Accepts optional config override. Prefer HuaProvider unless you need fine-grained provider control. |
| `ErrorBoundary` | component | React error boundary with optional custom fallback. Built into HuaPage; can also be used standalone. Import from '@hua-labs/hua/framework'. |
| `useMotion` | hook | Framework-level motion hook — wraps motion-core's useUnifiedMotion. Accepts { type: EntranceType, duration, autoStart } and returns { ref, style, start, stop }. Import from '@hua-labs/hua/framework'. |
| `BrandingProvider` | component | Context provider that makes branding config (colors, logo, fonts) available to BrandedButton and BrandedCard. Automatically included by HuaProvider when branding is set in defineConfig. |
| `useBranding` | hook | Access branding config from context. Returns null when no branding is configured. |
| `useBrandingColor` | hook | Retrieve a specific branding color by key (e.g. 'primary', 'secondary', 'accent'). Returns undefined when no branding is configured. |
| `useFocusManagement` | hook | A11y hook for programmatic focus management — move focus to a target ref. Import from '@hua-labs/hua/framework'. |
| `useFocusTrap` | hook | A11y hook that traps keyboard focus within a container (dialogs, drawers). Import from '@hua-labs/hua/framework'. |
| `SkipToContent` | component | Accessible skip-to-content link rendered at the top of the page for keyboard navigation. Import from '@hua-labs/hua/framework'. |
| `LiveRegion` | component | ARIA live region component for announcing dynamic content changes to screen readers. Import from '@hua-labs/hua/framework'. |
| `useLiveRegion` | hook | Hook to imperatively announce messages to screen readers via an ARIA live region. Import from '@hua-labs/hua/framework'. |
| `useDelayedLoading` | hook | Prevents loading flicker by delaying the visible loading state by a configurable threshold (default 200ms). Import from '@hua-labs/hua/framework'. |
| `useLoadingState` | hook | Manages async loading state with error capture. Import from '@hua-labs/hua/framework'. |
| `SuspenseWrapper` | component | Thin Suspense wrapper that accepts a skeleton fallback. Import from '@hua-labs/hua/framework'. |
| `withSuspense` | function | HOC that wraps a component in SuspenseWrapper. Import from '@hua-labs/hua/framework'. |
| `useData` | hook | Client-side data fetching hook with loading/error state. Import from '@hua-labs/hua/framework'. |
| `fetchData` | function | Async data fetching utility for use outside React components (e.g. RSC, actions). Import from '@hua-labs/hua/framework'. |
| `initLicense` | function | Initialize the hua license at app startup. Import from '@hua-labs/hua/framework'. |
| `getLicense` | function | Return the currently active LicenseInfo. Import from '@hua-labs/hua/framework'. |
| `checkLicense` | function | Check whether a specific LicenseFeature is available. Returns LicenseCheckResult. Import from '@hua-labs/hua/framework'. |
| `hasLicense` | function | Boolean guard — true when the specified LicenseFeature is licensed. Import from '@hua-labs/hua/framework'. |
| `requireLicense` | function | Throw if the specified LicenseFeature is not licensed (use at component/route level). Import from '@hua-labs/hua/framework'. |
| `pluginRegistry` | constant | Central plugin registry instance. Use registerPlugin / getPlugin / getAllPlugins helpers instead of accessing directly. Import from '@hua-labs/hua/framework'. |
| `registerPlugin` | function | Register a HuaPlugin at runtime. Import from '@hua-labs/hua/framework'. |
| `getPlugin` | function | Retrieve a registered plugin by name. Import from '@hua-labs/hua/framework'. |
| `getAllPlugins` | function | Return all registered HuaPlugin instances. Import from '@hua-labs/hua/framework'. |
| `generateGEOMetadata` | function | Generate Next.js Metadata object optimized for AI/LLM search engines (Generative Engine Optimization). Server-safe. Import from '@hua-labs/hua/framework'. |
| `renderJSONLD` | function | Render a JSON-LD script tag for structured data. Server-safe. Import from '@hua-labs/hua/framework'. |
| `generatePageMetadata` | function | Convenience wrapper around Next.js generateMetadata for standard SEO fields. Server-safe. Import from '@hua-labs/hua/framework'. |
| `generateCSSVariables` | function | Generate a CSS string of branding color variables for server-side injection (e.g. inline <style>). Import from '@hua-labs/hua/framework'. |
| `generateTailwindConfig` | function | Generate a Tailwind CSS config object from branding colors. Import from '@hua-labs/hua/framework'. |
| `createI18nMiddleware` | function | Create a Next.js middleware handler for i18n locale detection and routing. Import from '@hua-labs/hua/framework'. |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Architecture

`@hua-labs/hua` is a **meta-framework** that re-exports from sub-packages and adds a framework layer on top.

```
@hua-labs/hua
├── /framework        ← HuaProvider, defineConfig, HuaPage (hua-unique)
│   ├── HuaProvider   ← root provider (theme CSS + all sub-providers)
│   ├── HuaPage       ← page wrapper (vibe, ErrorBoundary, motion)
│   ├── defineConfig  ← framework configuration
│   ├── BrandedButton / BrandedCard / WelcomePage
│   ├── a11y          ← useFocusManagement, useFocusTrap, SkipToContent, LiveRegion
│   ├── loading       ← useDelayedLoading, SuspenseWrapper, withSuspense
│   ├── branding      ← BrandingProvider, useBranding, generateCSSVariables
│   ├── license       ← initLicense, requireLicense, hasLicense
│   ├── plugins       ← registerPlugin, getPlugin
│   ├── seo/geo       ← generateGEOMetadata, renderJSONLD, generatePageMetadata
│   └── middleware    ← createI18nMiddleware
├── /ui               ← re-export @hua-labs/ui (100+ components)
├── /motion           ← re-export @hua-labs/motion-core (40+ hooks)
├── /i18n             ← re-export @hua-labs/i18n-core
├── /state            ← re-export @hua-labs/state
├── /formatters       ← re-export @hua-labs/i18n-formatters
├── /hooks            ← re-export @hua-labs/hooks
├── /utils            ← re-export @hua-labs/utils
├── /loaders          ← re-export @hua-labs/i18n-loaders
└── /dot              ← re-export @hua-labs/dot
```

The main entry (`@hua-labs/hua`) exports everything flat for convenience. Use subpath imports for tree-shaking.

**Important overrides in the main entry:**
- `Button` → `BrandedButton` (not `@hua-labs/ui`'s Button). Use `UIButton` for the raw version.
- `Card` → `BrandedCard` (not `@hua-labs/ui`'s Card). Use `UICard` for the raw version.
- `usePresetMotion` is re-exported from `/framework`, not from motion-core.

## Re-export Categories

| Category | Source Package | Key Exports |
|----------|---------------|-------------|
| UI Core | `@hua-labs/ui` | Button (UIButton), Card (UICard), Input, Modal, Badge, Toast, Icon, Avatar, Progress, Skeleton, Alert, Tooltip, ThemeProvider, ScrollArea, Slot, merge, cn |
| UI Form | `@hua-labs/ui/form` | Form, FormField, Checkbox, Radio, Select, DatePicker, Upload, Autocomplete, ColorPicker, Slider, Textarea |
| UI Navigation | `@hua-labs/ui/navigation` | Navigation, Breadcrumb, Pagination, PageTransition |
| UI Overlay | `@hua-labs/ui/overlay` | Popover, Dropdown, Drawer, BottomSheet, ConfirmModal |
| UI Data | `@hua-labs/ui/data` | Table, CodeBlock |
| UI Interactive | `@hua-labs/ui/interactive` | Accordion, Tabs, Menu, ContextMenu, Command |
| UI Advanced | `@hua-labs/ui/advanced` | EmotionAnalysis, ChatMessage, ScrollProgress, LanguageToggle, FeatureCard, HeroSection, SectionHeader, StatsPanel, BarChart |
| Motion Core | `@hua-labs/motion-core` | useFadeIn, useSlideUp, useScrollReveal, useGesture, useStagger, useTypewriter, MOTION_PRESETS, Motion |
| i18n | `@hua-labs/i18n-core` | useTranslation, useI18n, I18nProvider, Translator, ssrTranslate |
| i18n Zustand | `@hua-labs/i18n-core-zustand` | createZustandI18n, useZustandI18n |
| State | `@hua-labs/state` | createHuaStore, createI18nStore, isStoreRehydrated |
| Pro | `@hua-labs/pro` | useAutoSlide, useMotionOrchestra, useSequence, useLayoutMotion, useScrollDirection, useVisibilityToggle |

## Configuration Presets

| Preset | Use Case | Includes |
|--------|----------|----------|
| `product` | Full-featured product app | UI + i18n + state + motion + branding |
| `landing` | Marketing/landing pages | UI + motion + GEO |
| `docs` | Documentation sites | UI + i18n + code blocks |

```tsx
// Minimal config — preset handles defaults
export default defineConfig({ preset: 'product' });
```

## Pro Features

Pro hooks are re-exported from `@hua-labs/pro` (dist-only, source not included in npm).

**Note:** `useMotion` and `useScrollToggle` from Pro are intentionally NOT re-exported from the main entry to avoid conflict with the framework's own `useMotion`. Access them via `@hua-labs/hua/pro` or directly from `@hua-labs/pro`.

| Hook | Purpose |
|------|---------|
| `useAutoSlide` | Auto-advancing slide/carousel motion |
| `useAutoScale` | Auto scale pulse animation |
| `useAutoFade` | Auto fade in/out cycling |
| `useAutoPlay` | Generic auto-play orchestration |
| `useMotionOrchestra` | Coordinate multiple motion sequences |
| `useOrchestration` | Fine-grained orchestration control |
| `useSequence` | Step-by-step animation sequences |
| `useLayoutMotion` | Layout-aware motion transitions |
| `useKeyboardToggle` | Keyboard-driven toggle animation |
| `useScrollDirection` | Detect scroll direction for show/hide UI |
| `useStickyToggle` | Sticky element toggle based on scroll |
| `useVisibilityToggle` | Intersection-based visibility toggle |
| `useInteractive` | Combined hover/focus/click interaction state |
| `usePerformanceMonitor` | Animation frame performance metrics |
| `useLanguageAwareMotion` | Adjust motion direction for RTL/LTR |
| `useGameLoop` | rAF-based game loop for canvas/interactive |

## Related Packages

- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)
- [`@hua-labs/motion-core`](https://www.npmjs.com/package/@hua-labs/motion-core)
- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core)
- [`@hua-labs/state`](https://www.npmjs.com/package/@hua-labs/state)

## License

MIT — [HUA Labs](https://hua-labs.com)
