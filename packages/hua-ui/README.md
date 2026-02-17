# @hua-labs/ui

Accessible, TypeScript-first component library for React applications. Provides 70+ production-ready components with modular entry points for optimal bundle size, dark mode support, and Tailwind CSS integration.

[![npm version](https://img.shields.io/npm/v/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![license](https://img.shields.io/npm/l/@hua-labs/ui.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **70+ components — Buttons, forms, tables, modals, overlays, and more**
- **Modular entry points — Import only what you need for optimal bundle size**
- **Accessible — ARIA attributes, keyboard navigation, WCAG compliant**
- **Dark mode — Built-in dark mode support**
- **Tailwind CSS — Utility-first styling with class variance authority**
- **Tree-shakeable — Side-effect free (except CSS)**

## Installation

```bash
pnpm add @hua-labs/ui
```

> Peer dependencies: @dnd-kit/core ^6.3.1, @dnd-kit/sortable ^10.0.0, @dnd-kit/utilities ^3.2.2, @hua-labs/motion-core >=2.0.0, react >=19.0.0, react-dom >=19.0.0

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
| `Button` | component | Primary action button with variants, sizes, and loading state |
| `Action` | component | Compact icon action button |
| `Input` | component | Text input with validation, prefix/suffix, and error states |
| `NumberInput` | component | Numeric input with increment/decrement controls |
| `Link` | component | Styled anchor with router integration |
| `Icon` | component | Universal icon component (Lucide, Phosphor, custom) |
| `Avatar` | component | User avatar with image fallback |
| `Modal` | component | Dialog overlay with backdrop and focus trap |
| `Container` | component | Responsive max-width container |
| `Grid` | component | CSS Grid layout wrapper |
| `Stack` | component | Flex stack layout (vertical/horizontal) |
| `Divider` | component | Visual separator (horizontal/vertical) |
| `Card` | component | Content container with header, body, footer slots |
| `Panel` | component | Collapsible content panel |
| `Badge` | component | Status badge with color variants |
| `Progress` | component | Progress bar with percentage |
| `Skeleton` | component | Content placeholder during loading |
| `Alert` | component | Inline alert with success/warning/error/info variants |
| `ToastProvider` | component | Toast notification provider |
| `useToast` | hook | Imperative toast API — toast.success(), toast.error() |
| `LoadingSpinner` | component | Animated loading indicator |
| `Tooltip` | component | Hover tooltip with positioning |
| `Label` | component | Form label with required indicator |
| `Switch` | component | Toggle switch for boolean values |
| `Toggle` | component | Pressable toggle button |
| `ScrollArea` | component | Custom scrollbar container |
| `ScrollToTop` | component | Scroll-to-top floating button |
| `ThemeProvider` | component | Dark/light theme context provider |
| `ThemeToggle` | component | Theme switch button |
| `useTheme` | hook | Theme context hook — { theme, setTheme } |
| `IconProvider` | component | Icon configuration context provider |
| `cn` | function | Tailwind-safe class name merging (clsx + tailwind-merge) |
| `Slot` | component | Polymorphic slot for asChild pattern |


## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)

## License

MIT — [HUA Labs](https://hua-labs.com)
