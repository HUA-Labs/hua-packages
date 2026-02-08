# hua-ux Developer Decision Minimization

## Overview

The core goal of hua-ux is to **reduce the decisions developers have to make every time**. The Preset system handles motion well, but the connection with UI components is lacking. This document covers the plan to fill those gaps.

## Current State

### Solved

1. **Motion decisions removed**: Preset auto-configures animation type, duration, and delay
2. **Spacing guide**: Preset provides spacing defaults
3. **Component defaults**: Reasonable default props provided

### Gaps

1. **Weak Preset-to-Component auto-connection**: Even with Presets, how to apply them to components is unclear
2. **Color decisions still needed**: Developers still have to decide "which color to use?"
3. **Typography decisions still needed**: No typography system in Presets
4. **Weak Layout-Preset connection**: Spacing preset doesn't auto-apply to actual components

## Design Decisions

### Core Principle
**"Aim for friendliness"** - Minimize developer decisions and provide **good defaults chosen by designers**.

### Items to Include
1. **Colors**: Define color palettes per Preset
2. **Typography**: Define heading/body size, weight, spacing (with future font subsetting in mind)
3. **Spacing**: Auto-configuration applied to components
4. **Component defaults**: Default styles for Button, Card, etc.

## Improvement Plan

### Phase 1: Preset Extension (Colors, Typography)

#### 1.1 Extended Preset Structure

```typescript
// packages/hua-ux/src/presets/product.ts
export const productPreset = {
  motion: { ... },
  spacing: { ... },

  // Added: Color system
  colors: {
    primary: 'blue',      // Main action color
    secondary: 'gray',    // Supporting color
    accent: 'purple',     // Emphasis color
    success: 'green',     // Success state
    warning: 'orange',    // Warning state
    error: 'red',         // Error state
    info: 'cyan',         // Info state
  },

  // Added: Typography system
  typography: {
    h1: { size: '2xl', weight: 'bold', lineHeight: 'tight' },
    h2: { size: 'xl', weight: 'semibold', lineHeight: 'snug' },
    h3: { size: 'lg', weight: 'semibold', lineHeight: 'snug' },
    h4: { size: 'base', weight: 'semibold', lineHeight: 'normal' },
    body: { size: 'base', weight: 'normal', lineHeight: 'relaxed' },
    small: { size: 'sm', weight: 'normal', lineHeight: 'relaxed' },
    caption: { size: 'xs', weight: 'normal', lineHeight: 'relaxed' },
  },

  // Added: Component defaults
  components: {
    button: {
      variant: 'default',
      size: 'md',
      color: 'primary',  // auto-uses preset.colors.primary
    },
    card: {
      variant: 'elevated',
      spacing: 'component',  // auto-uses preset.spacing.component
    },
    badge: {
      color: 'primary',
      size: 'md',
    },
  },

  i18n: { ... },
} as const;
```

#### 1.2 Marketing Preset Extension

```typescript
// packages/hua-ux/src/presets/marketing.ts
export const marketingPreset = {
  motion: { ... },
  spacing: { ... },
  colors: {
    primary: 'purple',    // Marketing uses more vibrant colors
    secondary: 'pink',
    accent: 'orange',
    // ...
  },
  typography: {
    h1: { size: '4xl', weight: 'bold' },  // Larger titles
    // ...
  },
  components: { ... },
  i18n: { ... },
} as const;
```

### Phase 2: Auto-Connect Presets to Components

#### 2.1 Context-Based Preset Provision

```typescript
// packages/hua-ux/src/framework/context/PresetContext.tsx
'use client';

import { createContext, useContext } from 'react';
import type { ProductPreset, MarketingPreset } from '../../presets';

type Preset = ProductPreset | MarketingPreset;

const PresetContext = createContext<Preset | null>(null);

export function PresetProvider({
  preset,
  children
}: {
  preset: Preset;
  children: React.ReactNode;
}) {
  return (
    <PresetContext.Provider value={preset}>
      {children}
    </PresetContext.Provider>
  );
}

export function usePreset(): Preset {
  const preset = useContext(PresetContext);
  if (!preset) {
    throw new Error('usePreset must be used within PresetProvider');
  }
  return preset;
}
```

#### 2.2 HuaUxLayout Auto-Applies Preset

```typescript
// packages/hua-ux/src/framework/components/HuaUxLayout.tsx
import { PresetProvider } from '../context/PresetContext';
import { productPreset } from '../../presets/product';

export function HuaUxLayout({
  children,
  preset = 'product'  // Default
}: {
  children: React.ReactNode;
  preset?: 'product' | 'marketing';
}) {
  const selectedPreset = preset === 'product' ? productPreset : marketingPreset;

  return (
    <PresetProvider preset={selectedPreset}>
      {/* existing providers */}
      {children}
    </PresetProvider>
  );
}
```

#### 2.3 Config File Preset

```typescript
// hua-ux.config.ts
export default defineConfig({
  preset: 'product',  // or 'marketing'
  // ...
});
```

### Phase 3: Auto Spacing

#### Layout Components Use Preset Spacing Automatically

```typescript
// packages/hua-ui/src/components/Stack.tsx
import { usePreset } from '@hua-labs/hua-ux/framework';

export function Stack({
  spacing,  // 'default' | 'section' | 'component' | number
  children,
  ...props
}: StackProps) {
  const preset = usePreset();

  // Auto-use Preset spacing (when no explicit spacing)
  const spacingValue = spacing || preset.spacing.default;

  return (
    <div
      className={merge(
        'flex flex-col',
        `gap-${spacingValue}`,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Phase 4: Components Auto-Use Presets

#### Button Component

```typescript
// packages/hua-ui/src/components/Button.tsx
import { usePreset } from '@hua-labs/hua-ux/framework';

export function Button({
  color,  // Explicit color takes priority
  variant,
  size,
  ...props
}: ButtonProps) {
  const preset = usePreset();

  // Get defaults from Preset (when no explicit props)
  const finalColor = color || preset.components.button.color;
  const finalVariant = variant || preset.components.button.variant;
  const finalSize = size || preset.components.button.size;

  // Use Preset colors
  const colorClass = preset.colors[finalColor];

  return (
    <button
      className={merge(colorClass, /* ... */)}
      {...props}
    />
  );
}
```

#### Typography Component

```typescript
// packages/hua-ui/src/components/Typography.tsx
import { usePreset } from '@hua-labs/hua-ux/framework';

type HeadingLevel = 1 | 2 | 3 | 4;

export function Heading({
  level,
  children,
  ...props
}: {
  level: HeadingLevel;
  children: React.ReactNode;
}) {
  const preset = usePreset();
  const typography = preset.typography[`h${level}`];

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={merge(
        `text-${typography.size}`,
        `font-${typography.weight}`,
        `leading-${typography.lineHeight}`,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Body({ children, ...props }) {
  const preset = usePreset();
  const typography = preset.typography.body;

  return (
    <p
      className={merge(
        `text-${typography.size}`,
        `font-${typography.weight}`,
        `leading-${typography.lineHeight}`,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
```

#### Card Component

```typescript
// packages/hua-ui/src/components/Card.tsx
import { usePreset } from '@hua-labs/hua-ux/framework';

export function Card({
  spacing,
  variant,
  ...props
}: CardProps) {
  const preset = usePreset();

  const finalSpacing = spacing || preset.components.card.spacing;
  const finalVariant = variant || preset.components.card.variant;
  const spacingClass = `p-${preset.spacing[finalSpacing]}`;

  return (
    <div
      className={merge(spacingClass, /* variant styles */)}
      {...props}
    />
  );
}
```

### Phase 5: Motion Preset Auto-Application

#### Component Motion Auto-Apply

```typescript
// packages/hua-ui/src/components/Card.tsx
import { usePreset } from '@hua-labs/hua-ux/framework';
import { useSlideUp } from '@hua-labs/motion-core';

export function Card({ children, ...props }: CardProps) {
  const preset = usePreset();
  const motion = useSlideUp(preset.motion.card);  // Preset motion auto-applied

  return (
    <div
      ref={motion.ref}
      style={motion.style}
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Motion Options

```typescript
// Disable motion per component
<Card motion={false}>  // No motion applied
<Card motion="custom" motionConfig={{ ... }}>  // Custom motion
```

## Before & After

### Before (Developer Makes All Decisions)

```tsx
<Button
  variant="default"
  size="md"
  color="blue"  // Which color?
  rounded="md"
  shadow="md"
>
  Click me
</Button>

<Card
  variant="elevated"
  className="p-6"  // What spacing?
>
  Content
</Card>

<h1 className="text-2xl font-bold">Title</h1>  // Typography?
```

### After (Preset Auto-Applied)

```tsx
// hua-ux.config.ts
export default defineConfig({
  preset: 'product',
});

// Developer just uses them
<Button>Click me</Button>  // Preset auto-applied
<Card>Content</Card>      // Preset spacing, motion auto-applied
<Heading level={1}>Title</Heading>  // Preset typography auto-applied
```

## Implementation Priority

### Phase 1 (Alpha -> Beta) - Define Defaults
- Preset colors (good defaults chosen by designers)
- Preset typography (with future font subsetting in mind)
- Preset component defaults
- PresetContext implementation
- HuaUxLayout PresetProvider integration

### Phase 2 (Beta) - Auto-Application
- Stack, Grid layout components use Preset spacing automatically
- Button, Card major components use Preset automatically
- Typography components (Heading, Body, etc.)

### Phase 3 (Beta -> Stable) - Polish
- All components with Preset applied
- Motion Preset auto-application
- Customization options (motion={false}, etc.)
- Font subsetting consideration

## Designer Perspective: Default Design Principles

### 1. Colors
- **Product Preset**: Professional, trustworthy blue series
- **Marketing Preset**: Vibrant, eye-catching purple/pink series
- Each Preset provides a consistent color palette

### 2. Typography
- **Current**: Size, weight, line-height defined
- **Future**: Font subsetting to include only necessary characters for performance optimization
- Clear heading/body hierarchy

### 3. Spacing
- **Auto-configuration**: If spacing is not specified on a component, Preset default is used
- Product: Conservative spacing (md)
- Marketing: Wide spacing (xl)

### 4. Component Defaults
- Each component has Preset-appropriate default styles
- Good defaults even when developers specify no props

## Migration Guide

```tsx
// Before
<Button variant="default" size="md" color="blue">
  Click
</Button>

// After (with Preset)
<Button>Click</Button>  // preset.components.button auto-applied

// After (explicit override)
<Button color="red">Click</Button>  // Only color overridden
```

## Type Definitions

```typescript
export interface PresetColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface PresetTypography {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  body: TypographyStyle;
  small: TypographyStyle;
  caption: TypographyStyle;
}

export interface TypographyStyle {
  size: string;
  weight: string;
  lineHeight: string;
}

export interface PresetComponents {
  button: {
    variant: string;
    size: string;
    color: keyof PresetColors;
  };
  card: {
    variant: string;
    spacing: 'default' | 'section' | 'component';
  };
  badge: {
    color: keyof PresetColors;
    size: string;
  };
}

export interface ExtendedPreset {
  motion: PresetConfig;
  spacing: {
    default: string;
    section: string;
    component: string;
  };
  colors: PresetColors;
  typography: PresetTypography;
  components: PresetComponents;
  i18n: {
    defaultLanguage: string;
    supportedLanguages: string[];
  };
}
```
