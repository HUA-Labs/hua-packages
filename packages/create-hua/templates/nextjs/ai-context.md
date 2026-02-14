# hua Project AI Context

This document is a guide for AI tools (Cursor, etc.) to understand the structure and usage of this project.

## Framework Deep Docs
IMPORTANT: Search `node_modules/@hua-labs/hua/.hua-agent-docs/` FIRST for:
- Architecture → 01-overview/
- Motion/i18n/Branding → 02-systems/
- Config → 03-config/
- Icon system (174 aliases, 96 icons, 12 categories) → 04-icon-system/
- API reference (all hooks, components) → 05-api-reference/
- Constraints & rules → 06-constraints/

### Icon System
Icon: 96 static + 174 aliases. Use `<Icon name="zap" size={20} />`.
Categories: navigation, actions, status, user, data, files, communication, media, emotions, security, time, ui, theme
Aliases: "back"→arrowLeft, "trash"→delete, "ai"→brain etc.
Full list: `node_modules/@hua-labs/hua/.hua-agent-docs/04-icon-system/02-icon-names.mdx`

### ThemeToggle
```tsx
import { ThemeToggle } from '@hua-labs/hua/ui';
<ThemeToggle variant="icon" />  // "button" | "icon" | "switch"
```

### Advanced Components
```tsx
import { GlowCard, TiltCard, SpotlightCard, Timeline, Marquee } from '@hua-labs/ui/advanced';
```

### i18n Lint
`@hua-labs/eslint-plugin-i18n` — 4 rules: no-missing-key, no-raw-text, no-dynamic-key, no-unused-key

### CSS Utilities
```css
@import "@hua-labs/ui/styles/utilities.css";
```
Provides: `.glass`, `.gradient-text`, `.sr-only`

## Project Overview

This project uses the **hua framework** for Next.js applications.

**Core Philosophy**: "You don't need to know Next.js. Just configure and tell AI what to do."

## Architecture Layers

### Top Layer: AI Context & CLI (Current Location)
- `.cursor/rules/hua-framework.mdc`: Cursor IDE rules (MDC format)
- `ai-context.md`: This document (project structure explanation)
- `AGENTS.md`: OpenAI Codex context
- `skills.md`: Antigravity skills
- `.claude/project-context.md`: Claude-specific context

### Middle Layer: Framework & Config
- `hua.config.ts`: Framework configuration
- `HuaProvider`: Automatic Provider setup
- `HuaPage`: Page wrapper (Motion, i18n, SEO automatically applied)

### Bottom Layer: Core & Types
- `@hua-labs/state`: State management
- `@hua-labs/motion-core`: Motion/animations
- `@hua-labs/i18n-core`: Internationalization
- `@hua-labs/ui`: UI component library

## Project Structure

```
Project Root/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (uses HuaProvider)
│   ├── page.tsx            # Home page (uses HuaPage)
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
└── hua.config.ts        # Framework configuration
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

### Component Props Quick Reference

**Button**:
```tsx
<Button variant="default | secondary | outline | destructive | ghost | link" size="sm | default | lg | icon">
```

**Badge**:
```tsx
<Badge variant="default | secondary | outline | destructive">
```

**Card**:
```tsx
<Card>
  <CardHeader><CardTitle>Title</CardTitle><CardDescription>Desc</CardDescription></CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

**Progress**:
```tsx
<Progress value={75} variant="default | success | warning | error | info" size="sm | default | lg" />
```

**Switch**:
```tsx
<Switch checked={value} onChange={(e) => setValue(e.target.checked)} />
```

**Alert**:
```tsx
<Alert variant="default | success | warning | error | info">Message</Alert>
```

**Tabs**:
```tsx
<Tabs defaultValue="tab1">
  <TabsList><TabsTrigger value="tab1">Tab 1</TabsTrigger></TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>
```

**CodeBlock**:
```tsx
<CodeBlock code={sourceCode} language="tsx" filename="example.tsx" showLineNumbers />
```

### @hua-labs/hua/framework

**Framework Components**:
- `HuaProvider`: Automatic Provider setup
- `HuaPage`: Page wrapper (Motion, i18n, SEO automatically applied)
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

### @hua-labs/hua/hooks

**Utility Hooks** (import from `@hua-labs/hua/hooks`):
- `useLoading`: Loading state management with delay support
- `useAutoScroll`: Auto-scrolling for chat/feed UIs
- `usePerformanceMonitor`: Performance metrics monitoring

### @hua-labs/hua/loaders

**Translation Loaders** (import from `@hua-labs/hua/loaders`):
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
import { HuaPage, useMotion, fetchData } from '@hua-labs/hua/framework';

// UI components
import { Button, Card } from '@hua-labs/hua/ui';

// i18n
import { useTranslation } from '@hua-labs/hua/i18n';

// Motion
import { useFadeIn, useScrollReveal } from '@hua-labs/hua/motion';

// Utility hooks
import { useLoading, useAutoScroll } from '@hua-labs/hua/hooks';

// Translation loaders (for advanced i18n setup)
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/hua/loaders';

// State management
import { createStore } from '@hua-labs/hua/state';

// Formatters
import { formatDate, formatCurrency } from '@hua-labs/hua/formatters';

// Utilities
import { cn } from '@hua-labs/hua/utils';
```

### 1. Page Creation Pattern

**Direct approach (recommended)** — use hooks directly for full control:

```tsx
// app/my-page/page.tsx
'use client';

import { useTranslation } from '@hua-labs/hua/i18n';
import { useFadeIn, useScrollReveal } from '@hua-labs/hua/motion';
import { Card, Button } from '@hua-labs/hua/ui';

export default function MyPage() {
  const { t } = useTranslation('my-page');
  const fade = useFadeIn({ duration: 600 });
  const reveal = useScrollReveal({ threshold: 0.1 });

  return (
    <div>
      <div ref={fade.ref} style={fade.style}>
        <h1>{t('my-page:title')}</h1>
      </div>
      <div ref={reveal.ref} style={reveal.style}>
        <Card>{/* content */}</Card>
      </div>
    </div>
  );
}
```

**HuaPage wrapper (optional)** — auto-applies motion, i18n key, and head metadata:

```tsx
import { HuaPage } from '@hua-labs/hua/framework';
<HuaPage title={t('title')} description={t('description')} i18nKey="my-page">
  {/* content */}
</HuaPage>
```

**Important**:
- Add translation keys to `translations/{language}/my-page.json`
- Motion hooks return `{ ref, style }` — apply **both** to the target element
- `HuaPage` is optional; using hooks directly gives more layout flexibility

### 2. Client Component Creation Pattern

```tsx
// components/MyComponent.tsx
'use client';

import { Card, Button } from '@hua-labs/hua/ui';
import { useMotion } from '@hua-labs/hua/framework';
import { useTranslation } from '@hua-labs/hua/i18n';

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
import { fetchData } from '@hua-labs/hua/framework';

export default async function DataPage() {
  const data = await fetchData<DataType>('/api/data');
  return <div>{/* display data */}</div>;
}
```

**Client Component**:
```tsx
// components/DataComponent.tsx
'use client';

import { useData } from '@hua-labs/hua/framework';
import { LoadingSpinner, AlertError } from '@hua-labs/hua/ui';

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

### hua.config.ts

```typescript
import { defineConfig } from '@hua-labs/hua/framework';

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
   - Wrap with `HuaPage`
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
   - Only modify `hua.config.ts`
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

- Framework docs: `node_modules/@hua-labs/hua/README.md`
- UI components: `node_modules/@hua-labs/ui/README.md`
- Motion: `node_modules/@hua-labs/motion-core/README.md`
- i18n: `node_modules/@hua-labs/i18n-core-zustand/README.md`
- `.cursor/rules/hua-framework.mdc`: Cursor IDE rules
- `AGENTS.md`: OpenAI Codex context
- `skills.md`: Antigravity skills
- `.claude/project-context.md`: Claude-specific context
