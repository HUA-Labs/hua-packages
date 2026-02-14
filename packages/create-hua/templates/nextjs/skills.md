# hua Framework Skills

> Skill definitions for AI agents working with hua framework projects.

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

## Skill: page-creation

**Description**: Create a new page in a hua framework project.

**When to use**: User asks to create a new page, route, or view.

**Steps**:
1. Create `app/{page-name}/page.tsx` using `HuaPage` wrapper
2. Import `useTranslation` from `@hua-labs/hua/i18n` for text content
3. Create `translations/ko/{page-name}.json` with Korean translations
4. Create `translations/en/{page-name}.json` with English translations
5. Use Server Component by default; add `'use client'` only if hooks are needed

**Template**:
```tsx
import { HuaPage } from '@hua-labs/hua/framework';
import { useTranslation } from '@hua-labs/hua/i18n';

export default function PageName() {
  const { t } = useTranslation('page-name');
  return (
    <HuaPage title={t('title')} description={t('description')}>
      <h1>{t('title')}</h1>
    </HuaPage>
  );
}
```

---

## Skill: component-creation

**Description**: Create a reusable React component using hua UI primitives.

**When to use**: User asks to create a component, widget, or UI element.

**Steps**:
1. Create `components/{ComponentName}.tsx` with `'use client'` directive
2. Import UI primitives from `@hua-labs/hua/ui`
3. Optionally add motion via `@hua-labs/hua/motion`
4. Use `useTranslation` for any user-facing text
5. Add proper TypeScript types for props

**Template**:
```tsx
'use client';

import { Card, Button } from '@hua-labs/hua/ui';
import { useFadeIn } from '@hua-labs/hua/motion';
import { useTranslation } from '@hua-labs/hua/i18n';

interface MyComponentProps {
  title?: string;
}

export function MyComponent({ title }: MyComponentProps) {
  const { t } = useTranslation('my-component');
  const motion = useFadeIn();

  return (
    <Card ref={motion.ref} style={motion.style}>
      <h2>{title ?? t('title')}</h2>
      <Button>{t('action')}</Button>
    </Card>
  );
}
```

---

## Skill: data-fetching

**Description**: Set up data fetching for server or client components.

**When to use**: User needs to load data from an API.

**Server Component pattern**:
```tsx
import { fetchData } from '@hua-labs/hua/framework';

export default async function DataPage() {
  const data = await fetchData<DataType>('/api/data');
  return <div>{/* render data */}</div>;
}
```

**Client Component pattern**:
```tsx
'use client';
import { useData } from '@hua-labs/hua/framework';
import { LoadingSpinner, AlertError } from '@hua-labs/hua/ui';

export function DataView() {
  const { data, isLoading, error } = useData<DataType>('/api/data');
  if (isLoading) return <LoadingSpinner />;
  if (error) return <AlertError>{error.message}</AlertError>;
  return <div>{/* render data */}</div>;
}
```

---

## Skill: translation

**Description**: Add or update internationalization strings.

**When to use**: User wants to add text, labels, or messages in multiple languages.

**Steps**:
1. Determine the namespace (matches page/component name, or `common` for shared)
2. Add keys to `translations/ko/{namespace}.json`
3. Add keys to `translations/en/{namespace}.json`
4. Use `useTranslation('{namespace}')` in the component

**Rules**:
- Always add both Korean and English
- Use flat key structure: `{ "title": "...", "description": "..." }`
- Use `common` namespace for shared translations
- Namespace must match the page/component file name

---

## Skill: config

**Description**: Modify hua framework configuration.

**When to use**: User wants to change presets, i18n settings, motion, branding, or state.

**File**: `hua.config.ts`

**Available options**:
```typescript
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
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
  },
  state: { persist: true, ssr: true },
  branding: {
    colors: { primary: '#3B82F6', secondary: '#8B5CF6' },
    typography: { fontFamily: { sans: ['Pretendard', 'sans-serif'] } },
  },
});
```

**Rules**:
- Only modify `hua.config.ts` for framework-level settings
- Prefer preset over manual configuration
- Presets: `'product'` (professional) or `'marketing'` (dramatic)
