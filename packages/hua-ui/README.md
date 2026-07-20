# @hua-labs/ui

Platform workspace authority for all 37 package entries in the accessible, TypeScript-first React component library. The public 2.4 core candidate is a separate source-ready projection with exactly 27 retained entries and 10 explicitly deferred entries.

[![npm version](https://img.shields.io/npm/v/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![license](https://img.shields.io/npm/l/@hua-labs/ui.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **70+ components — Buttons, forms, tables, modals, overlays, and more**
- **Modular entry points — Import only what you need for optimal bundle size**
- **Accessibility foundations — component-specific ARIA and keyboard contracts; browser and physical assistive-technology evidence remain separate**
- **Dark mode — Built-in dark mode support**
- **dot style engine — Cross-platform styling (Web CSSProperties / React Native StyleSheet) via dot prop**
- **Modular ESM entries — CSS assets and provider-registration entries declare their side effects explicitly**
- **Public 2.4 core candidate (source-ready only) retains exactly 27 package entries: @hua-labs/ui, @hua-labs/ui/advanced, @hua-labs/ui/advanced/dashboard, @hua-labs/ui/advanced/emotion, @hua-labs/ui/advanced/motion, @hua-labs/ui/data, @hua-labs/ui/feedback, @hua-labs/ui/form, @hua-labs/ui/icons, @hua-labs/ui/icons-bold, @hua-labs/ui/iconsax, @hua-labs/ui/iconsax-extended, @hua-labs/ui/interactive, @hua-labs/ui/interactive/kanban, @hua-labs/ui/landing, @hua-labs/ui/native, @hua-labs/ui/navigation, @hua-labs/ui/overlay, @hua-labs/ui/sdui, @hua-labs/ui/styles/base.css, @hua-labs/ui/styles/codeblock.css, @hua-labs/ui/styles/landing.css, @hua-labs/ui/styles/prose.css, @hua-labs/ui/styles/recommended-theme.css, @hua-labs/ui/styles/toast.css, @hua-labs/ui/styles/utilities.css, @hua-labs/ui/theme.**
- **Public 2.4 core candidate defers exactly 10 package entries and they are unavailable: @hua-labs/ui/ax, @hua-labs/ui/layout, @hua-labs/ui/lucide, @hua-labs/ui/motion, @hua-labs/ui/primitives, @hua-labs/ui/sdui/manifest, @hua-labs/ui/sdui/motion-core-validation, @hua-labs/ui/sdui/validation, @hua-labs/ui/theme/foundation, @hua-labs/ui/utils.**
- **Source-ready is not release-ready: final tarball, DTS, installed-consumer, version, release-plan, and npm authority remain unproven.**

## Installation

```bash
pnpm add @hua-labs/ui
```

> Peer dependencies: @dnd-kit/core ^6.3.1, @dnd-kit/sortable ^10.0.0, @dnd-kit/utilities ^3.2.2, @hua-labs/motion-core >=2.4.0, react >=19.0.0, react-dom >=19.0.0, react-native >=0.73.0

## Quick Start

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@hua-labs/ui';
import { Input, Select } from '@hua-labs/ui/form';

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

| Export | Type | Description |
|--------|------|-------------|
| `Box` | component | Base block primitive: div on web and View on React Native; native dot styles compose before the full consumer StyleProp |
| `Text` | component | Base text primitive: span on web and Text on React Native; native dot line clamps map to numberOfLines and explicit props win |
| `Pressable` | component | Interactive primitive for Web and React Native; Web keeps a removable 44px minimum below sm and natural sizing at sm and above while composing consumer events, refs, styles, and accessibility state |
| `Button` | component | Primary action button with variants, sizes, and loading state |
| `Action` | component | Compact icon action button |
| `Input` | component | Text input with validation, prefix/suffix, and error states |
| `NumberInput` | component | Numeric input with increment/decrement controls |
| `Link` | component | Styled anchor with router integration |
| `Icon` | component | Semantic icon component backed by the executable catalog; Phosphor is the default complete fallback, Lucide is a first-class optional alternative, and Iconsax is an opt-in product-style alternative |
| `Avatar` | component | User avatar with image fallback |
| `Modal` | component | Dialog overlay with backdrop; package docs do not claim browser focus containment or assistive-technology conformance without separate evidence |
| `Container` | component | Responsive max-width container |
| `Section` | component | Page section wrapper with optional header config (title, description, action) |
| `Grid` | component | CSS Grid layout wrapper |
| `Stack` | component | Flex stack layout (vertical/horizontal) |
| `Divider` | component | Visual separator (horizontal/vertical) |
| `Card` | component | Content container with header, body, footer slots |
| `Panel` | component | Collapsible content panel |
| `ActionToolbar` | component | Horizontal toolbar that renders a list of icon action buttons |
| `ComponentLayout` | component | Dev/docs layout that renders a component with labelled preview and code slots |
| `Prose` | component | Typography wrapper that applies readable prose styles to raw HTML/markdown content |
| `Badge` | component | Status badge with color variants |
| `Progress` | component | Progress bar with percentage |
| `Skeleton` | component | Content placeholder during loading |
| `Alert` | component | Inline alert with success/warning/error/info variants |
| `ToastProvider` | component | Toast provider with status/polite semantics for info and success, and alert/assertive semantics for warning and error; physical announcement behavior remains unproven |
| `useToast` | hook | Imperative toast API — toast.success(), toast.error() |
| `LoadingSpinner` | component | Animated loading indicator |
| `Tooltip` | component | ReactNode-compatible tooltip: one renderable element owns direct hover/focus/ref and visible-lifetime aria-describedby, while legacy text or grouped children use the existing wrapper and require consumer-provided focusability for keyboard exposure; SDUI still admits one non-empty string and owns one button trigger; browser and physical assistive-technology behavior remains unproven |
| `Label` | component | Form label with required indicator |
| `Switch` | component | Toggle switch for boolean values |
| `Toggle` | component | Pressable toggle button |
| `ScrollArea` | component | Custom scrollbar container |
| `ScrollToTop` | component | Scroll-to-top floating button |
| `ThemeProvider` | component | Dark/light theme context provider |
| `ThemeToggle` | component | Theme switch button |
| `useTheme` | hook | Theme context hook — { theme, setTheme } |
| `iconNames` | variable | Frozen exact-name inventory derived from the executable icon catalog |
| `iconProviderMapping` | variable | Catalog-derived provider bindings for Phosphor, Lucide, and Iconsax in the full platform workspace; public-candidate availability follows the retained profile |
| `isValidIconName` | function | Exact-membership type guard for canonical icon IDs and aliases; it does not normalize arbitrary strings |
| `getIconNameForProvider` | function | Resolve a verified semantic icon name to its explicit provider binding |
| `ICON_ALIASES` | variable | Map of alias strings to canonical icon names |
| `resolveIconAlias` | function | Resolve an alias to its canonical icon name, returning the input unchanged if not an alias |
| `getIconAliases` | function | Return the list of all registered icon alias strings |
| `IconProvider` | component | Icon configuration context provider |
| `registerLucideResolver` | function | Low-level resolver hook used by the platform @hua-labs/ui/lucide side-effect entry, which is deferred from the public core candidate |
| `merge` | function | Merge multiple class strings, filtering falsy values |
| `mergeIf` | function | Conditionally append a class string based on a boolean flag |
| `mergeMap` | function | Map over an object of conditional classes and merge the truthy ones |
| `cn` | function | Class name merging utility (clsx + tailwind-merge). Legacy — prefer dot prop for new code |
| `formatRelativeTime` | function | Format a Date as a human-readable relative time string (e.g. '3 minutes ago') |
| `Slot` | component | Polymorphic slot for asChild pattern |
| `composeRefs` | function | Compose multiple React refs into a single callback ref |
| `mergeProps` | function | Merge two sets of React props, combining event handlers and class names |
| `createColorStyles` | function | Generate Tailwind color class strings from a ColorStyleConfig |
| `useColorStyles` | hook | Hook that returns memoised color class strings from a ColorStyleConfig |
| `createVariantStyles` | function | Build a variant→class-string map for a component (e.g. solid, outline, ghost) |
| `createSizeStyles` | function | Build a size→class-string map (xs, sm, md, lg, xl) |
| `createRoundedStyles` | function | Build a rounded→class-string map (none, sm, md, lg, full) |
| `createShadowStyles` | function | Build a shadow level→class-string map |
| `createHoverStyles` | function | Build hover effect→class-string map (scale, brightness, opacity, etc.) |
| `HUA_SPRING_EASING` | variable | CSS cubic-bezier string for the HUA brand spring easing |
| `withDarkMode` | function | Wrap a class string with a dark: variant equivalent |
| `createGradient` | function | Generate a Tailwind gradient class string from from/via/to color stops |
| `withOpacity` | function | Append a Tailwind opacity modifier to a color class (e.g. bg-primary/50) |
| `isTextWhite` | function | Return true if a given color variant requires white text for contrast |
| `isGradientVariant` | function | Type-guard that checks whether a color value is a gradient variant string |
| `responsive` | function | Apply breakpoint prefixes to a class string (sm:, md:, lg:, etc.) |
| `conditionalClass` | function | Return a class string only when a condition is true, otherwise empty string |
| `useMicroMotion` | hook | Hook returning motion state, inline style, event handlers, and a Tailwind-compatible GPU class |
| `getMicroMotionClasses` | function | Generate Tailwind utility classes from a MicroMotionPreset and hover, active, and focus options |
| `EASING_FUNCTIONS` | variable | Map of named CSS cubic-bezier easing strings used by micro motion |
| `DURATIONS` | variable | Map of subtle, soft, springy, bouncy, and snappy duration tokens in milliseconds |
| `COMPONENT_MOTION_DEFAULTS` | variable | Default micro-motion configs keyed by component name |
| `MotionConfigProvider` | component | Context provider for per-component motion configuration overrides |
| `useMotionConfig` | hook | Read the current MotionConfigContext value |
| `useComponentMotion` | hook | Resolve the merged motion config for a specific component name |
| `useAnimatedEntrance` | hook | Trigger a CSS class-based entrance animation when an element enters the viewport |
| `useBreakpoint` | hook | Track the current responsive breakpoint (sm / md / lg / xl / 2xl) |
| `useDotEnv` | hook | Read dot-engine style tokens from a CSS custom-property environment |
| `useDotMap` | hook | Resolve a DotStyleMap (state→dot-string) to live style objects based on current state |
| `mergeStyles` | function | Merge two CSSProperties / style objects, with the second taking precedence |
| `resolveDot` | function | Resolve a dot-style string to a CSSProperties object at runtime |
| `BottomSheet` | component | Bottom overlay with role=dialog and consumer-owned accessible naming; does not claim aria-modal, focus containment/restoration, or background isolation |
| `Drawer` | component | Directional overlay with role=dialog and consumer-owned accessible naming; does not claim aria-modal, focus containment/restoration, or background isolation |
| `Textarea` | component | Multiline input with Booleanish aria-invalid preservation; error state forces aria-invalid=true and invalid styling |
| `KanbanBoard` | component | Web Kanban route with optional dnd-kit peers, mouse/touch/keyboard sensors, detached canonical metadata snapshots, preview-only hover, one-drop transaction commits, WIP fail-closed behavior, terminal-safe click activation, and bounded sanitized announcements; browser, touch-device, live-region speech, and physical assistive-technology evidence remain separate |
| `SDUIMotionIntent` | type | Declarative SDUI motion slot payload backed by @hua-labs/motion-core intent metadata; not a renderer hook or executable animation |

## Detailed Guide

[Detailed Guide](./DETAILED_GUIDE.md) — Full workspace usage plus the exact source-ready public 2.4 core-candidate boundary.

The Detailed Guide is included in the package tarball.

## Kanban drag transaction evidence

`@hua-labs/ui/interactive/kanban` is a Web route backed by the existing optional
`@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` peers. Mouse,
delayed-touch, and sortable-keyboard sensors feed a one-snapshot transaction:
hover is preview-only, one valid drop commits, and cancel, missing targets,
controlled drift, or WIP rejection remain callback-free.

Card metadata is admitted through bounded own-data descriptor traversal. A
transparent Proxy may run bounded reflection traps, but only a detached ordinary
plain-data snapshot and its canonical bytes can become transaction authority or
output. Throwing/revoked views fail closed and time-varying views cancel as drift;
this is transaction integrity, not a same-realm hostile-code sandbox. Every drag
terminal preserves the next independent click-only card activation.

Keyboard instructions and drag announcements are bounded and sanitized. Unit,
type/build, deterministic SSR placeholder, and packed peer-isolation evidence do
not prove physical touch behavior, browser live-region speech, or assistive-
technology output.

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot)
- [`@hua-labs/motion-core`](https://www.npmjs.com/package/@hua-labs/motion-core)

## License

MIT — [HUA Labs](https://hua-labs.com)
