# @hua-labs/ui

Accessible, TypeScript-first component library for React applications. Provides 70+ production-ready components with modular entry points for optimal bundle size, dark mode support, and cross-platform styling via the dot style engine.

[![npm version](https://img.shields.io/npm/v/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![license](https://img.shields.io/npm/l/@hua-labs/ui.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **70+ components — Buttons, forms, tables, modals, overlays, and more**
- **Modular entry points — Import only what you need for optimal bundle size**
- **Accessible — ARIA attributes, keyboard navigation, WCAG compliant**
- **Dark mode — Built-in dark mode support**
- **dot style engine — Cross-platform styling (Web CSSProperties / React Native StyleSheet) via dot prop**
- **Tree-shakeable — Side-effect free (except CSS)**

## Installation

```bash
pnpm add @hua-labs/ui
```

> Peer dependencies: @dnd-kit/core ^6.3.1, @dnd-kit/sortable ^10.0.0, @dnd-kit/utilities ^3.2.2, @hua-labs/motion-core >=2.4.1, react >=19.0.0, react-dom >=19.0.0, react-native >=0.73.0

## Quick Start

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from "@hua-labs/ui";
import { Input, Select } from "@hua-labs/ui/form";

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Email" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## API

| Export                      | Type      | Description                                                                                |
| --------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `Box`                       | component | Base block primitive (renders as <div> on web, View on native via .native.tsx)             |
| `Text`                      | component | Base text primitive (renders as <span> on web, Text on native via .native.tsx)             |
| `Pressable`                 | component | Interactive primitive with hover/focus dot styles (renders as <button> on web)             |
| `Button`                    | component | Primary action button with variants, sizes, and loading state                              |
| `Action`                    | component | Compact icon action button                                                                 |
| `Input`                     | component | Text input with validation, prefix/suffix, and error states                                |
| `NumberInput`               | component | Numeric input with increment/decrement controls                                            |
| `Link`                      | component | Styled anchor with router integration                                                      |
| `Icon`                      | component | Universal icon component (Lucide, Phosphor, custom)                                        |
| `Avatar`                    | component | User avatar with image fallback                                                            |
| `Modal`                     | component | Dialog overlay with backdrop and focus trap                                                |
| `Container`                 | component | Responsive max-width container                                                             |
| `Section`                   | component | Page section wrapper with optional header config (title, description, action)              |
| `Grid`                      | component | CSS Grid layout wrapper                                                                    |
| `Stack`                     | component | Flex stack layout (vertical/horizontal)                                                    |
| `Divider`                   | component | Visual separator (horizontal/vertical)                                                     |
| `Card`                      | component | Content container with header, body, footer slots                                          |
| `Panel`                     | component | Collapsible content panel                                                                  |
| `ActionToolbar`             | component | Horizontal toolbar that renders a list of icon action buttons                              |
| `ComponentLayout`           | component | Dev/docs layout that renders a component with labelled preview and code slots              |
| `Prose`                     | component | Typography wrapper that applies readable prose styles to raw HTML/markdown content         |
| `Badge`                     | component | Status badge with color variants                                                           |
| `Progress`                  | component | Progress bar with percentage                                                               |
| `Skeleton`                  | component | Content placeholder during loading                                                         |
| `Alert`                     | component | Inline alert with success/warning/error/info variants                                      |
| `ToastProvider`             | component | Toast notification provider                                                                |
| `useToast`                  | hook      | Imperative toast API — toast.success(), toast.error()                                      |
| `LoadingSpinner`            | component | Animated loading indicator                                                                 |
| `Tooltip`                   | component | Hover tooltip with positioning                                                             |
| `Label`                     | component | Form label with required indicator                                                         |
| `Switch`                    | component | Toggle switch for boolean values                                                           |
| `Toggle`                    | component | Pressable toggle button                                                                    |
| `ScrollArea`                | component | Custom scrollbar container                                                                 |
| `ScrollToTop`               | component | Scroll-to-top floating button                                                              |
| `ThemeProvider`             | component | Dark/light theme context provider                                                          |
| `ThemeToggle`               | component | Theme switch button                                                                        |
| `useTheme`                  | hook      | Theme context hook — { theme, setTheme }                                                   |
| `iconNames`                 | variable  | Complete list of all icon name strings available in the project                            |
| `iconProviderMapping`       | variable  | Map from icon name to its provider (lucide, phosphor, custom, etc.)                        |
| `isValidIconName`           | function  | Type-guard that checks whether a string is a valid icon name                               |
| `getIconNameForProvider`    | function  | Resolve the provider-specific icon identifier for a given icon name                        |
| `ICON_ALIASES`              | variable  | Map of alias strings to canonical icon names                                               |
| `resolveIconAlias`          | function  | Resolve an alias to its canonical icon name, returning the input unchanged if not an alias |
| `getIconAliases`            | function  | Return the list of all registered icon alias strings                                       |
| `IconProvider`              | component | Icon configuration context provider                                                        |
| `registerLucideResolver`    | function  | Register the Lucide icon resolver so the Icon component can render Lucide icons            |
| `merge`                     | function  | Merge multiple class strings, filtering falsy values                                       |
| `mergeIf`                   | function  | Conditionally append a class string based on a boolean flag                                |
| `mergeMap`                  | function  | Map over an object of conditional classes and merge the truthy ones                        |
| `cn`                        | function  | Class name merging utility (clsx + tailwind-merge). Legacy — prefer dot prop for new code  |
| `formatRelativeTime`        | function  | Format a Date as a human-readable relative time string (e.g. '3 minutes ago')              |
| `Slot`                      | component | Polymorphic slot for asChild pattern                                                       |
| `composeRefs`               | function  | Compose multiple React refs into a single callback ref                                     |
| `mergeProps`                | function  | Merge two sets of React props, combining event handlers and class names                    |
| `createColorStyles`         | function  | Generate Tailwind color class strings from a ColorStyleConfig                              |
| `useColorStyles`            | hook      | Hook that returns memoised color class strings from a ColorStyleConfig                     |
| `createVariantStyles`       | function  | Build a variant→class-string map for a component (e.g. solid, outline, ghost)              |
| `createSizeStyles`          | function  | Build a size→class-string map (xs, sm, md, lg, xl)                                         |
| `createRoundedStyles`       | function  | Build a rounded→class-string map (none, sm, md, lg, full)                                  |
| `createShadowStyles`        | function  | Build a shadow level→class-string map                                                      |
| `createHoverStyles`         | function  | Build hover effect→class-string map (scale, brightness, opacity, etc.)                     |
| `HUA_SPRING_EASING`         | variable  | CSS cubic-bezier string for the HUA brand spring easing                                    |
| `withDarkMode`              | function  | Wrap a class string with a dark: variant equivalent                                        |
| `createGradient`            | function  | Generate a Tailwind gradient class string from from/via/to color stops                     |
| `withOpacity`               | function  | Append a Tailwind opacity modifier to a color class (e.g. bg-primary/50)                   |
| `isTextWhite`               | function  | Return true if a given color variant requires white text for contrast                      |
| `isGradientVariant`         | function  | Type-guard that checks whether a color value is a gradient variant string                  |
| `responsive`                | function  | Apply breakpoint prefixes to a class string (sm:, md:, lg:, etc.)                          |
| `conditionalClass`          | function  | Return a class string only when a condition is true, otherwise empty string                |
| `useMicroMotion`            | hook      | Hook that returns CSS class strings for micro-interaction motion states                    |
| `getMicroMotionClasses`     | function  | Pure function that resolves micro-motion class strings from a config without a hook        |
| `EASING_FUNCTIONS`          | variable  | Map of named CSS cubic-bezier easing strings used by micro motion                          |
| `DURATIONS`                 | variable  | Map of semantic duration tokens (fast, normal, slow, etc.) in milliseconds                 |
| `COMPONENT_MOTION_DEFAULTS` | variable  | Default micro-motion configs keyed by component name                                       |
| `MotionConfigProvider`      | component | Context provider for per-component motion configuration overrides                          |
| `useMotionConfig`           | hook      | Read the current MotionConfigContext value                                                 |
| `useComponentMotion`        | hook      | Resolve the merged motion config for a specific component name                             |
| `useAnimatedEntrance`       | hook      | Trigger a CSS class-based entrance animation when an element enters the viewport           |
| `useBreakpoint`             | hook      | Track the current responsive breakpoint (sm / md / lg / xl / 2xl)                          |
| `useDotEnv`                 | hook      | Read dot-engine style tokens from a CSS custom-property environment                        |
| `useDotMap`                 | hook      | Resolve a DotStyleMap (state→dot-string) to live style objects based on current state      |
| `mergeStyles`               | function  | Merge two CSSProperties / style objects, with the second taking precedence                 |
| `resolveDot`                | function  | Resolve a dot-style string to a CSSProperties object at runtime                            |

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)

## License

MIT — [HUA Labs](https://hua-labs.com)
