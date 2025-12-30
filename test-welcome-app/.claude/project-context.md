# test-welcome-app - hua-ux Project Context

**Project Name**: test-welcome-app

This document provides **detailed project structure and configuration** for this specific hua-ux project.

> **Quick reference**: For essential patterns and guidelines, see `.claude/skills/hua-ux-framework/SKILL.md`

## Project Overview

This project uses the **hua-ux framework** for Next.js applications.

**Core Philosophy**: "You don't need to know Next.js. Just configure and tell AI what to do."

## Architecture Layers

### Top Layer: AI Context & CLI
- `.cursorrules`: Rules for Cursor IDE
- `.claude/project-context.md`: This document (for Claude)
- `ai-context.md`: General AI context

### Middle Layer: Framework & Config
- `hua-ux.config.ts`: Framework configuration
- `I18nProviderWrapper`: i18n Provider wrapper (use in layout.tsx)
- `HuaUxPage`: Page wrapper (Motion, i18n, SEO automatically applied)
- `UnifiedProviders`: All Providers unified

### Bottom Layer: Core & Types
- `@hua-labs/state`: State management
- `@hua-labs/motion-core`: Motion/animations
- `@hua-labs/i18n-core`: Internationalization
- `@hua-labs/ui`: UI component library

## Project Structure

```
Project Root/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (uses I18nProviderWrapper)
│   ├── page.tsx            # Home page (uses HuaUxPage)
│   └── api/                # API Routes
│       └── translations/   # i18n translation API
│           └── [language]/[namespace]/route.ts
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

## Available Components

### @hua-labs/ui (Core Components)

**Core UI**: `Button`, `Action`, `Input`, `Link`, `Icon`, `Avatar`, `Modal`

**Layout**: `Container`, `Grid`, `Stack`, `Divider`, `Card` (CardHeader, CardTitle, CardDescription, CardContent, CardFooter), `Panel`, `ActionToolbar`, `ComponentLayout`

**Navigation**: `Navigation`, `Breadcrumb`, `Pagination`, `PageNavigation`, `PageTransition`

**Data Display**: `Table`, `Badge`, `Progress`, `Skeleton` (various variants)

**Feedback**: `Alert` (Success, Warning, Error, Info), `Toast` (ToastProvider, useToast), `LoadingSpinner`, `Tooltip`

**Overlay**: `Popover`, `Dropdown`, `Drawer`, `BottomSheet`, `ConfirmModal`

**Form**: `Form`, `Label`, `Checkbox`, `Radio`, `Select`, `Switch`, `Slider`, `Textarea`, `DatePicker`, `Upload`, `Autocomplete`

**Interactive**: `Accordion`, `Tabs`, `Menu`, `ContextMenu`, `Command`

**Specialized**: `ScrollArea`, `ScrollToTop`, `ThemeProvider`, `ThemeToggle`, `useTheme`

### @hua-labs/hua-ux/framework

**Framework Components**:
- `I18nProviderWrapper`: i18n Provider wrapper (use in layout.tsx)
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

### 1. Page Creation Pattern

```tsx
// app/my-page/page.tsx
import { HuaUxPage } from '@hua-labs/hua-ux/framework';
import { useTranslation } from '@hua-labs/i18n-core';

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

import { Card, Button } from '@hua-labs/ui';
import { useMotion } from '@hua-labs/hua-ux/framework';
import { useTranslation } from '@hua-labs/i18n-core';

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
import { LoadingSpinner, AlertError } from '@hua-labs/ui';

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

## Understanding Configuration

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

## Guidelines for Claude Code Generation

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

## Vibe Coding Friendly

This project supports **vibe coding**:

- **Noun-centered configuration**: `preset: 'product'` (expresses intent)
- **Many decisions in one file**: `HuaUxPage` handles SEO, Motion, i18n all together
- **AI-friendly documentation**: Clear and comprehensive

## References

- **Quick reference**: `.claude/skills/hua-ux-framework/SKILL.md` (essential patterns)
- **Component styles**: `docs/COMPONENT_STYLE_GUIDE.md`
- **Motion hooks**: `docs/MOTION_HOOKS.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Quick start**: `docs/QUICK_START.md`
- `ai-context.md`: General AI context
- `.cursorrules`: Cursor IDE rules
- Framework docs: `node_modules/@hua-labs/hua-ux/README.md`
