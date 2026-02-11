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

> Peer dependencies: @dnd-kit/core ^6.3.1, @dnd-kit/sortable ^10.0.0, @dnd-kit/utilities ^3.2.2, react >=19.0.0, react-dom >=19.0.0

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
| `Button` | component |  |
| `Action` | component |  |
| `Input` | component |  |
| `NumberInput` | component |  |
| `Link` | component |  |
| `Icon` | component |  |
| `EmotionIcon` | component |  |
| `StatusIcon` | component |  |
| `LoadingIcon` | component |  |
| `SuccessIcon` | component |  |
| `ErrorIcon` | component |  |
| `Avatar` | component |  |
| `AvatarImage` | component |  |
| `AvatarFallback` | component |  |
| `Modal` | component |  |
| `Container` | component |  |
| `Grid` | component |  |
| `Stack` | component |  |
| `Divider` | component |  |
| `Card` | component |  |
| `CardHeader` | component |  |
| `CardFooter` | component |  |
| `CardTitle` | component |  |
| `CardDescription` | component |  |
| `CardContent` | component |  |
| `Panel` | component |  |
| `ActionToolbar` | component |  |
| `ComponentLayout` | component |  |
| `Badge` | component |  |
| `Progress` | component |  |
| `ProgressSuccess` | component |  |
| `ProgressWarning` | component |  |
| `ProgressError` | component |  |
| `ProgressInfo` | component |  |
| `ProgressGroup` | component |  |
| `Skeleton` | component |  |
| `SkeletonText` | component |  |
| `SkeletonCircle` | component |  |
| `SkeletonRectangle` | component |  |
| `SkeletonRounded` | component |  |
| `SkeletonCard` | component |  |
| `SkeletonAvatar` | component |  |
| `SkeletonImage` | component |  |
| `SkeletonUserProfile` | component |  |
| `SkeletonList` | component |  |
| `SkeletonTable` | component |  |
| `Alert` | component |  |
| `AlertSuccess` | component |  |
| `AlertWarning` | component |  |
| `AlertError` | component |  |
| `AlertInfo` | component |  |
| `ToastProvider` | component |  |
| `useToast` | hook |  |
| `useToastSafe` | hook |  |
| `LoadingSpinner` | component |  |
| `Tooltip` | component |  |
| `TooltipLight` | component |  |
| `TooltipDark` | component |  |
| `Label` | component |  |
| `Switch` | component |  |
| `Toggle` | component |  |
| `ScrollArea` | component |  |
| `ScrollToTop` | component |  |
| `ThemeProvider` | component |  |
| `ThemeToggle` | component |  |
| `useTheme` | hook |  |
| `iconCategories` | function |  |
| `emotionIcons` | function |  |
| `statusIcons` | function |  |
| `iconNames` | function |  |
| `iconProviderMapping` | function |  |
| `isValidIconName` | function |  |
| `getIconNameForProvider` | function |  |
| `ICON_ALIASES` | component |  |
| `resolveIconAlias` | function |  |
| `getIconAliases` | function |  |
| `IconProvider` | component |  |
| `useIconContext` | hook |  |
| `defaultIconConfig` | function |  |
| `getDefaultStrokeWidth` | function |  |
| `merge` | function |  |
| `mergeIf` | function |  |
| `mergeMap` | function |  |
| `cn` | function |  |
| `formatRelativeTime` | function |  |
| `Slot` | component |  |
| `composeRefs` | function |  |
| `mergeProps` | function |  |
| `createColorStyles` | function |  |
| `useColorStyles` | hook |  |
| `createVariantStyles` | function |  |
| `createSizeStyles` | function |  |
| `createRoundedStyles` | function |  |
| `createShadowStyles` | function |  |
| `createHoverStyles` | function |  |
| `HUA_SPRING_EASING` | component |  |
| `withDarkMode` | function |  |
| `createGradient` | function |  |
| `withOpacity` | function |  |
| `isTextWhite` | function |  |
| `isGradientVariant` | function |  |
| `responsive` | function |  |
| `conditionalClass` | function |  |
| `useMicroMotion` | hook |  |
| `getMicroMotionClasses` | function |  |
| `EASING_FUNCTIONS` | component |  |
| `DURATIONS` | component |  |
| `COMPONENT_MOTION_DEFAULTS` | component |  |
| `CSS_MOTION_VARS` | component |  |
| `useInView` | hook |  |
| `useScrollProgress` | hook |  |
| `useMouse` | hook |  |
| `useReducedMotion` | hook |  |
| `useWindowSize` | hook |  |
| `ButtonProps` | type |  |
| `NumberInputProps` | type |  |
| `IconProps` | type |  |
| `ModalProps` | type |  |
| `CardProps` | type |  |
| `CardHeaderProps` | type |  |
| `CardTitleProps` | type |  |
| `CardDescriptionProps` | type |  |
| `CardContentProps` | type |  |
| `CardFooterProps` | type |  |
| `ActionToolbarProps` | type |  |
| `ActionButton` | type |  |
| `Toast` | type |  |
| `ToggleProps` | type |  |
| `ThemeProviderProps` | type |  |
| `ThemeProviderState` | type |  |
| `IconName` | type |  |
| `ProjectIconName` | type |  |
| `AllIconName` | type |  |
| `IconProviderProps` | type |  |
| `IconSet` | type |  |
| `PhosphorWeight` | type |  |
| `IconConfig` | type |  |
| `SlotProps` | type |  |
| `ColorStyleConfig` | type |  |
| `ColorStyles` | type |  |
| `SizeStyles` | type |  |
| `Rounded` | type |  |
| `Shadow` | type |  |
| `HoverEffect` | type |  |
| `MicroMotionConfig` | type |  |
| `MicroMotionPreset` | type |  |
| `MicroMotionState` | type |  |
| `Color` | type |  |
| `Size` | type |  |
| `BaseVariant` | type |  |
| `ExtendedVariant` | type |  |
| `UseInViewOptions` | type |  |
| `UseInViewReturn` | type |  |
| `UseScrollProgressOptions` | type |  |
| `UseScrollProgressReturn` | type |  |
| `UseMouseOptions` | type |  |
| `UseMouseReturn` | type |  |
| `UseWindowSizeOptions` | type |  |
| `UseWindowSizeReturn` | type |  |


## Documentation

- [Documentation Site](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua) — Framework (UI + Motion + i18n)
- [`@hua-labs/ui-dashboard`](https://www.npmjs.com/package/@hua-labs/ui-dashboard) — Dashboard domain components
- [`@hua-labs/motion-core`](https://www.npmjs.com/package/@hua-labs/motion-core) — Animation hooks

## Requirements

React >= 19.0.0 · React DOM >= 19.0.0 · Tailwind CSS · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://hua-labs.com)
