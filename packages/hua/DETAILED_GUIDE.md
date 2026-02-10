# @hua-labs/hua Detailed Guide

Technical reference for the @hua-labs/hua framework architecture and features.

---

### Architecture Overview
hua is a framework layer built on Next.js. It integrates UI, motion, and internationalization libraries with pre-configured defaults to standardize product development.

### Framework Integration Strategies

#### Strategy 1: Framework Layer
Automates provider configuration through a central settings file. This method provides the full framework experience, including integrated state and i18n management.
- **UI Benefit**: Framework users gain access to a curated selection of General-purpose Dashboard components from the Pro suite (StatCard, MetricCard, etc.) without additional licensing.
```tsx
// hua.config.ts
export default defineConfig({
  preset: 'product',
  i18n: { defaultLanguage: 'ko', namespaces: ['common'] }
});

// app/layout.tsx
<HuaProvider>{children}</HuaProvider>
```

#### Strategy 2: Modular Usage
Manual integration of individual packages for projects requiring non-standard configurations. Pro/Advanced components are limited to their respective distribution tiers.

---

### Technical Features

#### 1. GEO (Generative Engine Optimization)
Generates structured metadata and JSON-LD to assist search engines and language models in indexing application content.

#### 2. Accessibility (A11y) Implementation
- **SkipToContent**: Provides a bypass mechanism for keyboard navigation to skip repeated elements.
- **Focus Management**: Automatically manages focus during page transitions or within modal dialogs.
- **LiveRegion**: Provides an interface for announcing dynamic content changes to assistive technologies.

#### 3. Operational Safety
- **HuaPage**: Implements a standard ErrorBoundary to manage component-level crashes.
- **Error Reporting**: Provides a centralized hook for connecting to error monitoring services.

#### 4. UX Optimization
- **useDelayedLoading**: Delays the display of loading indicators for short-duration asynchronous operations to limit visual noise.
- **SuspenseWrapper**: Integrates with React Suspense to provide structured loading states.
