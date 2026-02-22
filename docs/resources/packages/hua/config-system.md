# hua Config System

## Overview

The `hua.config.ts` configuration system designed for a general-purpose framework.

## Design Principles

### 1. Zero-Config First
- Works without a config file
- Select a single preset and most things are resolved
- Progressive configuration (defaults -> Preset -> custom)

### 2. Declarative Configuration
- Declare "what to do"
- The framework decides "how to do it"
- Minimize developer decisions

### 3. Escape Hatch
- All features can be disabled
- Can fall back to pure Next.js
- Hybrid usage supported

## Configuration Structure (4 Layers)

### 1. Core (Basic Info)

```typescript
{
  preset: 'product' | 'marketing' | 'dashboard' | 'minimal',
  strictMode: boolean,  // File structure validation strictness
}
```

- `preset`: The most important setting. This alone determines most things.
- `strictMode`: Whether to raise build errors on framework rule violations.

### 2. UI & UX (Sensitivity Settings)

```typescript
{
  theme: {
    mode: 'class' | 'media' | 'none',  // Dark mode strategy
    colors: {
      primary: string,  // Tailwind color name or hex
      // ... or use Preset colors
    },
  },
  motion: {
    preset: 'high-performance' | 'balanced' | 'luxury',
    // or use Preset motion
  },
  typography: {
    fontStack: string[],  // Default font stack
    // or use Preset typography
  },
}
```

- Selecting a Preset auto-configures most of this.
- Customize only what you need.

### 3. Features (Feature Modules)

```typescript
{
  i18n: {
    locales: string[],
    defaultLocale: string,
    strategy: 'sub-domain' | 'path' | 'cookie' | 'header',
    // ...
  },
  state: {
    persistence: 'localStorage' | 'sessionStorage' | 'none',
    ssr: boolean,
  },
  analytics: {
    provider: 'ga4' | 'amplitude' | 'pixel' | 'custom',
    key?: string,  // API key (optional)
  },
}
```

- Each feature can be independently enabled/disabled.
- Unused features are excluded entirely (tree-shaking).

### 4. Infrastructure (Environment Settings)

```typescript
{
  runtime: 'nodejs' | 'edge' | 'auto',
  security: {
    csp: boolean,  // CSP header auto-configuration
    middleware: boolean,  // Security middleware activation
  },
}
```

- Auto-optimized based on runtime.
- Edge Runtime constraints handled automatically.

## Configuration Examples

### Minimal Config (Preset Only)

```typescript
// hua.config.ts
import { defineConfig } from '@hua-labs/hua/framework';

export default defineConfig({
  preset: 'product',
  // Done! Everything else uses defaults
});
```

### Medium Config (Preset + Partial Customization)

```typescript
export default defineConfig({
  preset: 'product',
  i18n: {
    locales: ['ko', 'en', 'ja'],
    defaultLocale: 'ko',
  },
  analytics: {
    provider: 'ga4',
    key: process.env.GA4_KEY,
  },
});
```

### Advanced Config (Full Customization)

```typescript
export default defineConfig({
  // No preset, all settings manual
  theme: {
    mode: 'class',
    colors: {
      primary: '#3B82F6',  // Custom color
    },
  },
  motion: {
    preset: 'balanced',
  },
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
    strategy: 'path',
  },
  // ...
});
```

## Implementation

### Config Schema

```typescript
// packages/hua/src/framework/config/schema.ts
export interface HuaConfig {
  // Core
  preset?: 'product' | 'marketing' | 'dashboard' | 'minimal';
  strictMode?: boolean;

  // UI & UX (from Preset or customized)
  theme?: {
    mode?: 'class' | 'media' | 'none';
    colors?: {
      primary?: string;
      // ...
    };
  };
  motion?: {
    preset?: 'high-performance' | 'balanced' | 'luxury';
  };

  // Features
  i18n?: { /* ... */ };
  state?: { /* ... */ };
  analytics?: { /* ... */ };

  // Infrastructure
  runtime?: 'nodejs' | 'edge' | 'auto';
  security?: { /* ... */ };
}
```

### Preset Merge Logic

```typescript
// packages/hua/src/framework/config/merge.ts
export function mergePresetWithConfig(
  preset: Preset,
  userConfig: Partial<HuaConfig>
): HuaConfig {
  // Preset defaults + user config merge
  // User config takes priority
  return {
    ...preset,
    ...userConfig,
    // Deep merge (nested objects)
  };
}
```

### Zero-Config Support

```typescript
// packages/hua/src/framework/config/index.ts
export function loadConfig(): HuaConfig {
  // 1. Attempt to load config file
  // 2. If none, use Preset defaults (product)
  // 3. If no Preset, use minimum defaults
  return defaultConfig;
}
```

## Escape Hatch Design

### 1. Component-Level Opt-out

```typescript
// Skip HuaPage and use pure Next.js
export default function Page() {
  return <div>Content</div>;  // No framework
}

// Or use only specific features
import { useTranslation } from '@hua-labs/hua';
export default function Page() {
  const { t } = useTranslation();
  return <div>{t('welcome')}</div>;  // i18n only
}
```

### 2. Config-Level Opt-out

```typescript
export default defineConfig({
  preset: 'product',
  motion: {
    enableAnimations: false,  // Disable motion
  },
  i18n: undefined,  // No i18n
});
```

### 3. Provider-Level Opt-out

```typescript
// Use specific providers directly instead of HuaProvider
import { I18nProvider } from './lib/i18n-setup';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider>{children}</I18nProvider>
        {/* Other providers omitted */}
      </body>
    </html>
  );
}
```

## Type Safety

### Runtime Validation with Zod

```typescript
import { z } from 'zod';

const configSchema = z.object({
  preset: z.enum(['product', 'marketing', 'dashboard', 'minimal']).optional(),
  strictMode: z.boolean().optional(),
  // ...
});

export function validateConfig(config: unknown): HuaConfig {
  return configSchema.parse(config);
}
```

### Compile-Time Validation with TypeScript

```typescript
export function defineConfig<T extends Partial<HuaConfig>>(
  config: T
): HuaConfig {
  // Type check + runtime validation
  return validateConfig(config);
}
```

## Documentation via JSDoc

```typescript
/**
 * Define framework configuration
 *
 * @param config.preset - Preset to use ('product' | 'marketing' | ...)
 *   - 'product': Professional, efficient (default)
 *   - 'marketing': Dramatic, eye-catching
 *   - 'dashboard': Data-focused, minimal motion
 *   - 'minimal': Bare minimum, maximum performance
 *
 * @example
 * ```ts
 * export default defineConfig({
 *   preset: 'product',
 * });
 * ```
 */
export function defineConfig(config: Partial<HuaConfig>): HuaConfig {
  // ...
}
```
