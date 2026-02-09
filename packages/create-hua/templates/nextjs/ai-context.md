# hua-ux Project AI Context

This document is a guide for AI tools (Cursor, etc.) to understand the structure and usage of this project.

## Project Overview

This project uses the **hua-ux framework** for Next.js applications.

**Core Philosophy**: "You don't need to know Next.js. Just configure and tell AI what to do."

## Architecture Layers

### Top Layer: AI Context & CLI (Current Location)
- `.cursorrules`: Rules for AI to follow when generating code
- `ai-context.md`: This document (project structure explanation)
- `.claude/project-context.md`: Claude-specific context

### Middle Layer: Framework & Config
- `hua-ux.config.ts`: Framework configuration
- `HuaUxLayout`: Automatic Provider setup
- `HuaUxPage`: Page wrapper (Motion, i18n, SEO automatically applied)

### Bottom Layer: Core & Types
- `@hua-labs/state`: State management
- `@hua-labs/motion-core`: Motion/animations
- `@hua-labs/i18n-core`: Internationalization
- `@hua-labs/ui`: UI component library

## Project Structure

```
Project Root/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (uses HuaUxLayout)
│   ├── page.tsx            # Home page (uses HuaUxPage)
│   └── api/                # API Routes
│       └── translations/   # i18n translation API
├── components/             # Reusable components
├── lib/                    # Utility functions
│   └── i18n-setup.ts      # i18n setup
├── store/                  # Zustand stores
│   └── useAppStore.ts     # Global state
├── translations/           # Translation files
│   ├── ko/                # Korean
│   │   └── common.json    # Common translations
│   └── en/                # English
│       └── common.json    # Common translations
└── hua-ux.config.ts        # Framework configuration
```

## Styling (Tailwind CSS v4)

### Critical: @theme Directive

This project uses **Tailwind CSS v4** which requires `@theme` directive for color utilities.

**globals.css** imports the HUA-UI recommended theme:
```css
@import "tailwindcss";
@import "@hua-labs/ui/styles/recommended-theme.css";
```

### Available CSS Variables

The theme provides these CSS variables (usable as Tailwind classes):

| Variable | Light Mode | Dark Mode | Tailwind Class |
|----------|------------|-----------|----------------|
| `--background` | Light gray | Dark gray | `bg-background` |
| `--foreground` | Dark text | Light text | `text-foreground` |
| `--primary` | HUA Teal | HUA Teal | `bg-primary`, `text-primary` |
| `--secondary` | Light gray | Dark gray | `bg-secondary` |
| `--muted` | Muted gray | Muted gray | `bg-muted`, `text-muted-foreground` |
| `--accent` | Light teal | Dark teal | `bg-accent` |
| `--destructive` | Red | Red | `bg-destructive` |
| `--border` | Border gray | Border gray | `border-border` |
| `--card` | White | Dark | `bg-card` |

### Common Styling Patterns

```tsx
// Background and text
<div className="bg-background text-foreground">

// Cards
<div className="bg-card text-card-foreground border border-border rounded-lg">

// Muted text
<p className="text-muted-foreground">

// Primary button
<button className="bg-primary text-primary-foreground">

// Destructive/error
<div className="bg-destructive text-destructive-foreground">
```

### Troubleshooting

**"bg-primary not working"**: Make sure `@import "@hua-labs/ui/styles/recommended-theme.css"` exists in globals.css

**Dark mode not working**: Add `dark` class to `<html>` element or use `ThemeProvider` from `@hua-labs/ui`

## Available Components and Hooks

### @hua-labs/ui Components

**Core UI**:
- `Button`, `Action`, `Input`, `Link`, `Icon`, `Avatar`, `Modal`

**Layout**:
- `Container`, `Grid`, `Stack`, `Divider`, `Card` (CardHeader, CardTitle, CardDescription, CardContent, CardFooter), `Panel`, `ActionToolbar`, `ComponentLayout`

**Navigation**:
- `Navigation`, `Breadcrumb`, `Pagination`, `PageNavigation`, `PageTransition`

**Data Display**:
- `Table`, `Badge`, `Progress`, `Skeleton` (various variants)

**Feedback**:
- `Alert` (Success, Warning, Error, Info), `Toast` (ToastProvider, useToast), `LoadingSpinner`, `Tooltip`

**Overlay**:
- `Popover`, `Dropdown`, `Drawer`, `BottomSheet`, `ConfirmModal`

**Form**:
- `Form`, `Label`, `Checkbox`, `Radio`, `Select`, `Switch`, `Slider`, `Textarea`, `DatePicker`, `Upload`, `Autocomplete`

**Interactive**:
- `Accordion`, `Tabs`, `Menu`, `ContextMenu`, `Command`

**Specialized**:
- `ScrollArea`, `ScrollToTop`, `ThemeProvider`, `ThemeToggle`, `useTheme`

### @hua-labs/hua-ux/framework

**Framework Components**:
- `HuaUxLayout`: Automatic Provider setup
- `HuaUxPage`: Page wrapper (Motion, i18n, SEO automatically applied)
- `UnifiedProviders`: All Providers unified
- `BrandedButton`, `BrandedCard`: Components with automatic branding
- `ErrorBoundary`: Error boundary

**Hooks**:
- `useMotion`: Unified motion hook
- `useData`: Client data fetching
- `useFocusManagement`, `useFocusTrap`: Accessibility hooks
- `useDelayedLoading`, `useLoadingState`: Loading state hooks
- `useLiveRegion`: Screen reader support

**Utilities**:
- `fetchData`: Server data fetching
- `generatePageMetadata`: SEO metadata generation
- `generateGEOMetadata`: GEO metadata generation
- `createI18nMiddleware`: i18n middleware creation

**Configuration**:
- `defineConfig`: Framework configuration definition
- `getConfig`: Get configuration

### @hua-labs/hua-ux/hooks

**Utility Hooks** (import from `@hua-labs/hua-ux/hooks`):
- `useLoading`: Loading state management with delay support
- `useAutoScroll`: Auto-scrolling for chat/feed UIs
- `usePerformanceMonitor`: Performance metrics monitoring

### @hua-labs/hua-ux/loaders

**Translation Loaders** (import from `@hua-labs/hua-ux/loaders`):
- `createApiTranslationLoader`: API-based translation loading with caching
- `preloadNamespaces`: Preload translation namespaces for instant display
- `warmFallbackLanguages`: Pre-warm fallback language translations
- `withDefaultTranslations`: Provide default translations for offline/SSR

### @hua-labs/motion-core

**Motion Hooks**:
- `useFadeIn`, `useSlideUp`, `useSlideLeft`, `useSlideRight`, `useScaleIn`, `useBounceIn`, `usePulse`, `useSpringMotion`
- `useHoverMotion`, `useClickToggle`, `useFocusToggle`
- `useScrollReveal`, `useScrollProgress`

### @hua-labs/i18n-core

**i18n Hooks**:
- `useTranslation`: Translation hook
- `useLanguage`: Language change hook

## Key Patterns

### 0. Available Subpath Imports

```tsx
// Framework core
import { HuaUxPage, useMotion, fetchData } from '@hua-labs/hua-ux/framework';

// UI components
import { Button, Card } from '@hua-labs/hua-ux/ui';

// i18n
import { useTranslation } from '@hua-labs/hua-ux/i18n';

// Motion
import { useFadeIn, useScrollReveal } from '@hua-labs/hua-ux/motion';

// Utility hooks
import { useLoading, useAutoScroll } from '@hua-labs/hua-ux/hooks';

// Translation loaders (for advanced i18n setup)
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/hua-ux/loaders';

// State management
import { createStore } from '@hua-labs/hua-ux/state';

// Formatters
import { formatDate, formatCurrency } from '@hua-labs/hua-ux/formatters';

// Utilities
import { cn } from '@hua-labs/hua-ux/utils';
```

### 1. Page Creation Pattern

```tsx
// app/my-page/page.tsx
import { HuaUxPage } from '@hua-labs/hua-ux/framework';
import { useTranslation } from '@hua-labs/hua-ux/i18n';

export default function MyPage() {
  const { t } = useTranslation('my-page');
  
  return (
    <HuaUxPage title={t('title')} description={t('description')}>
      <h1>{t('title')}</h1>
      {/* content */}
    </HuaUxPage>
  );
}
```

**Important**: 
- Wrapping with `HuaUxPage` automatically applies Motion, i18n, SEO
- Add translation keys to `translations/{language}/my-page.json`
- Create as Server Component (add `'use client'` only when client features are needed)

### 2. Client Component Creation Pattern

```tsx
// components/MyComponent.tsx
'use client';

import { Card, Button } from '@hua-labs/hua-ux/ui';
import { useMotion } from '@hua-labs/hua-ux/framework';
import { useTranslation } from '@hua-labs/hua-ux/i18n';

export function MyComponent() {
  const { t } = useTranslation('my-component');
  const motion = useMotion();
  
  return (
    <Card ref={motion.ref} style={motion.style}>
      <h2>{t('title')}</h2>
      <Button>{t('button')}</Button>
    </Card>
  );
}
```

**Important**:
- Client components require `'use client'`
- Utilize framework components (`@hua-labs/ui`, `@hua-labs/motion-core`)
- Consider applying motion

### 3. Data Fetching Pattern

**Server Component**:
```tsx
// app/data/page.tsx
import { fetchData } from '@hua-labs/hua-ux/framework';

export default async function DataPage() {
  const data = await fetchData<DataType>('/api/data');
  return <div>{/* display data */}</div>;
}
```

**Client Component**:
```tsx
// components/DataComponent.tsx
'use client';

import { useData } from '@hua-labs/hua-ux/framework';
import { LoadingSpinner, AlertError } from '@hua-labs/hua-ux/ui';

export function DataComponent() {
  const { data, isLoading, error } = useData<DataType>('/api/data');
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <AlertError>{error.message}</AlertError>;
  return <div>{/* display data */}</div>;
}
```

### 4. Translation File Pattern

```json
// translations/ko/my-page.json
{
  "title": "Title",
  "description": "Description",
  "button": "Button"
}

// translations/en/my-page.json
{
  "title": "Title",
  "description": "Description",
  "button": "Button"
}
```

**Important**:
- Add all translation keys to both Korean and English
- Namespace should match page name
- Use `common` namespace for shared translations

## Understanding Configuration Files

### hua-ux.config.ts

```typescript
import { defineConfig } from '@hua-labs/hua-ux/framework';

export default defineConfig({
  preset: 'product',  // 'product' or 'marketing'
  
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    fallbackLanguage: 'en',
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
  
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
  },
  
  state: {
    persist: true,
    ssr: true,
  },
});
```

**Preset Selection**:
- `'product'`: For product pages (professional, efficient)
- `'marketing'`: For marketing pages (dramatic, eye-catching)

**Branding Configuration** (optional):
```typescript
branding: {
  colors: {
    primary: '#000000',
    secondary: '#666666',
  },
  typography: {
    fontFamily: {
      sans: ['Pretendard', 'sans-serif'],
    },
  },
}
```

## Guidelines for AI Code Generation

1. **When Creating Pages**:
   - Wrap with `HuaUxPage`
   - Generate translation files together
   - Use `useTranslation` hook
   - Prefer Server Components (add `'use client'` only when client features are needed)

2. **When Creating Components**:
   - Add `'use client'` directive (for client components)
   - Utilize framework components
   - Consider applying motion
   - Consider accessibility (aria-label, etc.)

3. **When Adding Translations**:
   - Add both Korean and English
   - Maintain namespace consistency
   - Use `common` namespace for shared translations

4. **When Changing Configuration**:
   - Only modify `hua-ux.config.ts`
   - Prefer Preset (over manual configuration)

5. **When Fetching Data**:
   - Use `fetchData` in Server Components
   - Use `useData` in Client Components
   - Error handling is required

## Common Commands

```bash
# Start development server
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Lint
pnpm lint

# Fix linting automatically
pnpm lint:fix
```

## References

- Framework docs: `node_modules/@hua-labs/hua-ux/README.md`
- UI components: `node_modules/@hua-labs/ui/README.md`
- Motion: `node_modules/@hua-labs/motion-core/README.md`
- i18n: `node_modules/@hua-labs/i18n-core-zustand/README.md`
- `.cursorrules`: Cursor IDE rules
- `.claude/project-context.md`: Claude-specific context
