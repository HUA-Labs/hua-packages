# hua Framework — Project Guide

> This document helps AI coding agents understand and generate code for this project.

## Philosophy

**"You don't need to know Next.js. Just configure and tell AI what to do."**

- Config-driven development via `hua.config.ts`
- SDK-first: use `@hua-labs/ui` and `@hua-labs/hua` packages before custom code
- Server Components by default; `'use client'` only when needed

## Architecture

```
Top Layer — AI Context & Config
├── hua.config.ts          → Framework configuration (preset, i18n, motion, branding)
├── ai-context.md          → AI context (SSOT)
├── AGENTS.md              → This file
└── .cursor/rules/         → Cursor IDE rules

Middle Layer — Framework
├── HuaProvider            → Root layout provider (wraps all providers)
├── HuaPage                → Page wrapper (auto: Motion, i18n, SEO)
└── UnifiedProviders       → All providers unified

Bottom Layer — Core Packages
├── @hua-labs/ui            → UI component library
├── @hua-labs/motion-core   → Ref-based animation engine
├── @hua-labs/i18n-core     → Internationalization
└── @hua-labs/state         → Zustand-based state management
```

## Project Structure

```
app/                        → Next.js App Router pages
├── layout.tsx              → Root layout (HuaProvider)
├── page.tsx                → Home (HuaPage)
├── globals.css             → Styles (@import tailwindcss + hua theme)
└── api/translations/       → i18n API route
components/                 → Reusable components
lib/                        → Utilities (i18n-setup.ts, utils.ts)
store/                      → Zustand stores (useAppStore.ts)
translations/               → Translation JSON files
├── ko/common.json
└── en/common.json
hua.config.ts               → Framework config
```

## Import Map

```tsx
// Framework
import { HuaPage, HuaProvider, useMotion, useData, fetchData } from '@hua-labs/hua/framework';
import { defineConfig } from '@hua-labs/hua/framework/config';

// UI (atomic)
import { Button, Card, Input, Icon, Modal, Badge, Alert } from '@hua-labs/hua/ui';

// UI (composite — subpath imports)
import { Form, Select, DatePicker } from '@hua-labs/ui/form';
import { Popover, Dropdown, Drawer, BottomSheet } from '@hua-labs/ui/overlay';
import { Table, CodeBlock } from '@hua-labs/ui/data';
import { Accordion, Tabs, Menu, Command } from '@hua-labs/ui/interactive';
import { Navigation, Breadcrumb, Pagination } from '@hua-labs/ui/navigation';
import { Toast, LoadingSpinner, Tooltip } from '@hua-labs/ui/feedback';

// i18n
import { useTranslation, useLanguage } from '@hua-labs/hua/i18n';

// Motion
import { useFadeIn, useSlideUp, useScrollReveal } from '@hua-labs/hua/motion';

// Hooks
import { useLoading, useAutoScroll } from '@hua-labs/hua/hooks';

// Loaders
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/hua/loaders';

// State
import { createStore } from '@hua-labs/hua/state';

// Utils
import { cn } from '@hua-labs/hua/utils';
import { formatDate, formatCurrency } from '@hua-labs/hua/formatters';
```

## UI Components

### Core UI
Button, Action, Input, NumberInput, Link, Icon (EmotionIcon, StatusIcon, LoadingIcon), Avatar, Modal

### Layout
Container, Grid, Stack, Divider, Card (CardHeader, CardTitle, CardDescription, CardContent, CardFooter), Panel, ActionToolbar

### Data Display
Badge, Progress (Success/Warning/Error/Info/Group), Skeleton (Text/Circle/Rectangle/Card/Avatar/Image/List/Table), Table, CodeBlock

### Feedback
Alert (Success/Warning/Error/Info), Toast (ToastProvider + useToast), LoadingSpinner, Tooltip (Light/Dark)

### Form
Form, Label, Checkbox, Radio, Select, Switch, Slider, Textarea, DatePicker, Upload, Autocomplete

### Overlay
Popover, Dropdown, Drawer, BottomSheet, ConfirmModal

### Interactive
Accordion, Tabs, Menu, ContextMenu, Command

### Navigation
Navigation, Breadcrumb, Pagination, PageNavigation, PageTransition

### Theme
ThemeProvider, ThemeToggle, useTheme, ScrollArea, ScrollToTop

## Key Patterns

### Page Creation

```tsx
// app/my-page/page.tsx
import { HuaPage } from '@hua-labs/hua/framework';
import { useTranslation } from '@hua-labs/hua/i18n';

export default function MyPage() {
  const { t } = useTranslation('my-page');
  return (
    <HuaPage title={t('title')} description={t('description')}>
      <h1>{t('title')}</h1>
    </HuaPage>
  );
}
```

Always create translation files alongside:
- `translations/ko/my-page.json` — `{ "title": "제목", "description": "설명" }`
- `translations/en/my-page.json` — `{ "title": "Title", "description": "Description" }`

### Client Component

```tsx
'use client';
import { Card, Button } from '@hua-labs/hua/ui';
import { useFadeIn } from '@hua-labs/hua/motion';
import { useTranslation } from '@hua-labs/hua/i18n';

export function MyComponent() {
  const { t } = useTranslation('my-component');
  const motion = useFadeIn();
  return (
    <Card ref={motion.ref} style={motion.style}>
      <h2>{t('title')}</h2>
      <Button>{t('action')}</Button>
    </Card>
  );
}
```

### Data Fetching

```tsx
// Server Component
import { fetchData } from '@hua-labs/hua/framework';
export default async function Page() {
  const data = await fetchData<MyType>('/api/data');
  return <div>{/* render data */}</div>;
}

// Client Component
'use client';
import { useData } from '@hua-labs/hua/framework';
import { LoadingSpinner, AlertError } from '@hua-labs/hua/ui';
export function DataView() {
  const { data, isLoading, error } = useData<MyType>('/api/data');
  if (isLoading) return <LoadingSpinner />;
  if (error) return <AlertError>{error.message}</AlertError>;
  return <div>{/* render data */}</div>;
}
```

## Styling

**Tailwind CSS v4** with semantic CSS variables from `@hua-labs/ui/styles/recommended-theme.css`:

```css
/* globals.css */
@import "tailwindcss";
@import "@hua-labs/ui/styles/recommended-theme.css";
```

Key classes: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-card`, `text-card-foreground`, `border-border`, `text-muted-foreground`, `bg-accent`, `bg-destructive`

Dark mode: use `dark:` variants. `ThemeProvider` handles class toggling on `<html>`.

Use `cn()` for conditional class merging (never raw concatenation).

## Configuration

```typescript
// hua.config.ts
import { defineConfig } from '@hua-labs/hua/framework/config';

export default defineConfig({
  preset: 'product',                    // 'product' | 'marketing'
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
  motion: { defaultPreset: 'product', enableAnimations: true },
  state: { persist: true, ssr: true },
  // branding: { colors: { primary: '#3B82F6' } },
});
```

Presets: `'product'` (professional, efficient) | `'marketing'` (dramatic, eye-catching)

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix lint issues
```

## Rules for Code Generation

1. **Use framework components first** — `@hua-labs/ui` before custom UI
2. **Generate i18n files** — both ko + en when creating pages/components
3. **Server Components default** — `'use client'` only for hooks/interactivity
4. **Wrap pages with `HuaPage`** — auto SEO, motion, i18n
5. **TypeScript strict** — no `any`, explicit types
6. **Accessibility** — aria-label, keyboard nav, focus management
7. **Config over code** — use `hua.config.ts` for framework-level settings
8. **Use `cn()`** for class merging
