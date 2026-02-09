# hua Preset System

## Overview

The Preset system pre-defines things developers would otherwise have to decide every time (colors, spacing, typography, motion, etc.) and applies them automatically.

## Goal

**Minimize developer decisions**: Reach a level where you "just use it."

## Preset Structure

### Current Structure (Alpha)

```typescript
export const productPreset = {
  motion: { ... },      // Implemented
  spacing: { ... },     // Implemented
  i18n: { ... },        // Implemented
}
```

### Extended Structure (Beta Target)

```typescript
export const productPreset = {
  motion: { ... },      // Implemented
  spacing: { ... },     // Implemented
  colors: { ... },      // Planned
  typography: { ... },  // Planned
  components: { ... },  // Planned
  i18n: { ... },        // Implemented
}
```

## Preset Types

### 1. Product Preset

**Use case**: Product pages, dashboards, general product UI

**Characteristics**:
- Conservative motion (fast transitions, minimal delay)
- Consistent spacing (md default)
- Minimal hover/click interactions
- Professional colors (blue primary)
- Standard typography

**Usage**:
```tsx
<HuaUxLayout preset="product">
  <Button>Click</Button>  // productPreset applied automatically
</HuaUxLayout>
```

### 2. Marketing Preset

**Use case**: Landing pages, marketing pages

**Characteristics**:
- Dramatic motion (slow transitions, long delays)
- Wide spacing (xl default)
- Emphasized hover/click interactions
- Vibrant colors (purple primary)
- Large typography

**Usage**:
```tsx
<HuaUxLayout preset="marketing">
  <Button>Click</Button>  // marketingPreset applied automatically
</HuaUxLayout>
```

## Applying Presets

### 1. In the Config File

```typescript
// hua.config.ts
export default defineConfig({
  preset: 'product',  // Apply product preset to the entire app
});
```

### 2. In Layout

```tsx
// app/layout.tsx
import { HuaUxLayout } from '@hua-labs/hua/framework';

export default function RootLayout({ children }) {
  return (
    <HuaUxLayout preset="product">
      {children}
    </HuaUxLayout>
  );
}
```

### 3. Automatic Usage in Components

```tsx
// Preset applied automatically
<Button>Click</Button>  // preset.components.button auto-applied
<Card>Content</Card>   // preset.components.card auto-applied
<Heading level={1}>Title</Heading>  // preset.typography.h1 auto-applied
```

## Preset vs Explicit Props

### Preset Priority (Default)

```tsx
<Button>Click</Button>  // Uses preset.components.button
```

### Explicit Props Priority (Override)

```tsx
<Button color="red">Click</Button>  // Only color overridden, rest from preset
```

### Full Custom

```tsx
<Button
  color="red"
  size="lg"
  variant="outline"
>
  Click
</Button>  // All props explicitly specified
```

## Preset Expansion Plan

### Phase 1: Basic Preset Extension
- Add colors, typography, components to Product Preset
- Add colors, typography, components to Marketing Preset

### Phase 2: Additional Presets
- Dashboard Preset (dashboard-specific)
- Blog Preset (blog-specific)
- E-commerce Preset (e-commerce-specific)

### Phase 3: Custom Presets
- User-defined Preset creation
- Preset extension/merge capabilities

---

## Design Defaults

### Color Palette

Each preset defines these colors:

1. **Primary**: Main action color (buttons, links, etc.)
2. **Secondary**: Supporting color (backgrounds, secondary elements)
3. **Accent**: Emphasis color (special highlights)
4. **Success**: Success state (completion, success messages)
5. **Warning**: Warning state (caution, warning messages)
6. **Error**: Error state (errors, deletion, etc.)
7. **Info**: Informational state (info messages)

#### Product Preset Colors
- Primary: **Light blue** (trust, professionalism, approachable)
- Secondary: Gray series (neutral)
- Accent: Purple series (calm emphasis)

#### Marketing Preset Colors
- Primary: Purple/pink series (vibrant, creative)
- Secondary: Orange series (energy)
- Accent: Gradient usage

**Color application**:
```tsx
// Product Preset
<Button>Click</Button>  // Automatically blue (primary)

// Marketing Preset
<Button>Click</Button>  // Automatically purple (primary)
```

### Typography System

#### Hierarchy

1. **H1**: Main heading (largest, boldest)
2. **H2**: Section heading
3. **H3**: Sub-section heading
4. **H4**: Small heading
5. **Body**: Body text (most common)
6. **Small**: Small text
7. **Caption**: Caption, description text

#### Preset-Specific Typography

**Product Preset**:
- H1: 2xl, bold, tight line-height
- H2: xl, semibold, snug
- H3: lg, semibold, snug
- H4: base, semibold, normal
- Body: base, normal, relaxed

**Marketing Preset**:
- H1: 4xl, bold (larger titles for impact)
- Body: wide spacing for readability

#### Heading hierarchy: H1(2xl) > H2(xl) > H3(lg) > H4(base)

### Spacing System

**Auto-configuration principle**: If spacing is not specified, the Preset default is used automatically.

- Product: Conservative spacing (md)
- Marketing: Wide spacing (xl)

```tsx
// No spacing specified -> Preset default used
<Stack>  // Product: md spacing, Marketing: xl spacing (automatic)
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</Stack>

// Explicit specification overrides Preset
<Stack spacing="lg">  // lg spacing used
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</Stack>
```

### Component Defaults

#### Button
- **Product**: Blue, medium size, moderate rounding
- **Marketing**: Purple, large size, rounded corners

#### Card
- **Product**: Thin shadow, moderate padding
- **Marketing**: Thick shadow, wide padding

#### Badge
- **Product**: Small size, calm colors
- **Marketing**: Large size, vibrant colors

### Customization

```tsx
// Default (Preset auto-applied)
<Button>Click</Button>

// Partial customization
<Button color="red">Delete</Button>  // Only color changed

// Full customization
<Button
  color="red"
  size="lg"
  variant="outline"
>
  Custom Button
</Button>
```

## Type Definitions

```typescript
// packages/hua/src/presets/types.ts
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
  size: string;        // 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' etc.
  weight: string;     // 'normal' | 'medium' | 'semibold' | 'bold' etc.
  lineHeight: string; // 'tight' | 'snug' | 'normal' | 'relaxed' etc.
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
