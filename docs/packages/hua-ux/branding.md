# hua-ux Branding & White-Labeling

## Overview

A system that makes it easy to remove default branding and apply custom brand identity. This document covers the white-labeling implementation and branded components.

## Implemented Features

### 1. Branding Configuration Type

`HuaUxConfig` includes a `branding` field:
- `name`: Company/service name
- `logo`: Logo path
- `colors`: Color palette (primary, secondary, accent, success, warning, error, info)
- `typography`: Typography settings (fontFamily, fontSize)
- `customVariables`: Custom CSS variables

### 2. CSS Variable Auto-Generation

`generateCSSVariables()` function:
- Converts branding config to CSS variable string
- `:root { --color-primary: #3B82F6; }` format

`generateCSSVariablesObject()` function:
- Converts branding config to CSS variable object
- Can be used directly with React's `style` prop

### 3. Tailwind Config Auto-Generation

`generateTailwindConfig()` function:
- Converts branding config to Tailwind Config object
- Can be merged directly into `tailwind.config.js`

### 4. BrandingContext

`BrandingProvider`: Provider that supplies branding configuration
`useBranding()`: Hook to retrieve branding configuration
`useBrandingColor()`: Hook to retrieve a specific color

### 5. UnifiedProviders Integration

`BrandingProvider` is automatically integrated into `UnifiedProviders`:
- `useBranding()` is available in all components

## Configuration

### Config File

```typescript
// hua-ux.config.ts
import { defineConfig } from '@hua-labs/hua-ux/framework';

export default defineConfig({
  preset: 'product',
  branding: {
    name: 'My Company',
    logo: '/logo.svg',
    colors: {
      primary: '#3B82F6',    // Blue
      secondary: '#8B5CF6',  // Purple
      accent: '#F59E0B',     // Orange
    },
    typography: {
      fontFamily: ['Inter', 'sans-serif'],
      fontSize: {
        h1: '2xl',
        h2: 'xl',
        body: 'base',
      },
    },
  },
});
```

### Branding Config Type

```typescript
export interface HuaUxConfig {
  // ...existing config

  branding?: {
    name?: string;
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      success?: string;
      warning?: string;
      error?: string;
      info?: string;
    };
    typography?: {
      fontFamily?: string[];
      fontSize?: {
        h1?: string;
        h2?: string;
        h3?: string;
        body?: string;
      };
    };
    customVariables?: Record<string, string>;
  };
}
```

## CSS Variable Generation

```typescript
// packages/hua-ux/src/framework/branding/css-vars.ts
export function generateCSSVariables(branding: BrandingConfig): string {
  const vars: string[] = [];

  // Color variables
  if (branding.colors) {
    Object.entries(branding.colors).forEach(([key, value]) => {
      vars.push(`  --color-${key}: ${value};`);
    });
  }

  // Typography variables
  if (branding.typography) {
    if (branding.typography.fontFamily) {
      vars.push(`  --font-family: ${branding.typography.fontFamily.join(', ')};`);
    }
    if (branding.typography.fontSize) {
      Object.entries(branding.typography.fontSize).forEach(([key, value]) => {
        vars.push(`  --font-size-${key}: ${value};`);
      });
    }
  }

  // Custom variables
  if (branding.customVariables) {
    Object.entries(branding.customVariables).forEach(([key, value]) => {
      vars.push(`  --${key}: ${value};`);
    });
  }

  return `:root {\n${vars.join('\n')}\n}`;
}
```

## Tailwind Config Generation

```typescript
// packages/hua-ux/src/framework/branding/tailwind-config.ts
export function generateTailwindConfig(branding: BrandingConfig): object {
  return {
    theme: {
      extend: {
        colors: branding.colors ? {
          primary: branding.colors.primary,
          secondary: branding.colors.secondary,
          // ...
        } : {},
        fontFamily: branding.typography?.fontFamily ? {
          sans: branding.typography.fontFamily,
        } : {},
      },
    },
  };
}
```

## Usage Examples

### CSS Variables in Styles

```typescript
import { generateCSSVariables } from '@hua-labs/hua-ux/framework';
import { getConfig } from '@hua-labs/hua-ux/framework';

const config = getConfig();
const cssVars = generateCSSVariables(config.branding!);
export const globalStyles = cssVars;
```

### Tailwind Config Integration

```javascript
// tailwind.config.js
const { generateTailwindConfig } = require('@hua-labs/hua-ux/framework');
const { getConfig } = require('@hua-labs/hua-ux/framework');

const config = getConfig();
const brandingConfig = generateTailwindConfig(config.branding || {});

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      ...brandingConfig.theme.extend,
    },
  },
};
```

### In Components

```tsx
'use client';

import { useBranding, useBrandingColor } from '@hua-labs/hua-ux/framework';

export function MyComponent() {
  const branding = useBranding();
  const primaryColor = useBrandingColor('primary', 'blue');

  return (
    <div style={{ color: primaryColor }}>
      <h1 style={{ fontFamily: branding?.typography?.fontFamily?.[0] }}>
        {branding?.name || 'My App'}
      </h1>
    </div>
  );
}
```

---

## Branded Components

`hua-ux/framework` provides components that automatically apply branding configuration.

### BrandedButton

Automatically applies branding's primary, secondary, and accent colors to the Button component.

```tsx
import { BrandedButton } from '@hua-labs/hua-ux/framework';

// Automatically applies primary color if branding is configured
<BrandedButton variant="default">Save</BrandedButton>

// Automatically applies secondary color
<BrandedButton variant="secondary">Cancel</BrandedButton>

// Automatically applies accent color (outline)
<BrandedButton variant="outline">View</BrandedButton>
```

**Auto-apply Rules**:
- `variant="default"`: Uses branding's `primary` color
- `variant="secondary"`: Uses branding's `secondary` color
- `variant="outline"`: Uses branding's `accent` color

### BrandedCard

Automatically applies branding colors to the Card component.

```tsx
import { BrandedCard } from '@hua-labs/hua-ux/framework';

<BrandedCard variant="outline">
  <CardContent>Content</CardContent>
</BrandedCard>
```

**Auto-apply Rules**:
- `variant="outline"`: Uses branding's `accent` color as border
- `variant="default"`: Applies a subtle tint of branding's `primary` color as background

### When Branding is Not Configured

When branding is not configured, Branded Components behave identically to the default `Button` and `Card` components.

```tsx
// Works normally even without branding
<BrandedButton variant="default">Save</BrandedButton>
<BrandedCard variant="elevated">Content</BrandedCard>
```

## Implementation: CSS Variables Approach

Branded Components use **CSS variables** to leverage Tailwind's optimization.

**Advantages**:
- Leverages Tailwind's JIT compiler optimization
- Clean code without inline styles
- Dynamic color changes at runtime
- Browser caching optimization

### CSS Variable Auto-Injection

`BrandingProvider` automatically injects CSS variables into `:root`.

```css
:root {
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-accent: #F59E0B;
}
```

### Tailwind Arbitrary Values

Components use Tailwind's arbitrary values:

```tsx
// Inside BrandedButton
className="bg-[var(--color-primary)] text-white"
```

## Default vs Branded Components

### Button vs BrandedButton
- **Button**: Hard-coded colors (blue-600, etc.)
- **BrandedButton**: Auto-applied branding colors via CSS variables

### Card vs BrandedCard
- **Card**: Default colors (slate, etc.)
- **BrandedCard**: Auto-applied branding colors via CSS variables

## Migration Guide

Replace `Button` and `Card` with `BrandedButton` and `BrandedCard` to automatically apply branding:

```tsx
// Before
import { Button, Card } from '@hua-labs/ui';

// After
import { BrandedButton, BrandedCard } from '@hua-labs/hua-ux/framework';
```

## Next Steps

### Component Auto-Application

Currently, components require manual `useBranding()` usage. The next step is auto-applying to major components like Button, Card, etc.:

```tsx
// packages/hua-ui/src/components/Button.tsx
import { useBrandingColor } from '@hua-labs/hua-ux/framework';

export function Button({ color, ...props }) {
  const brandingPrimary = useBrandingColor('primary');
  const finalColor = color || brandingPrimary || 'blue';
  // ...
}
```
