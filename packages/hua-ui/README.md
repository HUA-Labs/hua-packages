# @hua-labs/ui

TypeScript-first React UI components with modular Web and React Native entry points.

[![npm version](https://img.shields.io/npm/v/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![license](https://img.shields.io/npm/l/@hua-labs/ui.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **Broad component coverage — Buttons, forms, tables, modals, overlays, and more**
- **Modular entry points — Import only what you need for optimal bundle size**
- **Accessibility foundations — component-specific ARIA and keyboard contracts; browser and physical assistive-technology evidence remain separate**
- **Theme state — Light, dark, and system root-class management with consumer-owned semantic variables**
- **dot style engine — Cross-platform styling (Web CSSProperties / React Native StyleSheet) via dot prop; no Tailwind CSS required**
- **Modular ESM entries — CSS assets and provider-registration entries declare their side effects explicitly**

## Installation

```bash
pnpm add @hua-labs/ui
```

> Required peer dependencies: react >=19.0.0
>
> Optional peers (feature-specific): @dnd-kit/core ^6.3.1, @dnd-kit/sortable ^10.0.0, @dnd-kit/utilities ^3.2.2, @hua-labs/motion-core >=2.4.0, react-dom >=19.0.0, react-native >=0.73.0

## Quick Start

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent, Label } from '@hua-labs/ui';
import { Input } from '@hua-labs/ui/form';

function App() {
  return (
    <Card dot="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => event.preventDefault()}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Button type="submit" dot="mt-4 w-full">Sign Up</Button>
        </form>
      </CardContent>
    </Card>
  );
}

```

## Detailed Guide

[Detailed Guide](https://github.com/HUA-Labs/hua-packages/blob/main/packages/hua-ui/DETAILED_GUIDE.md) — Usage, API, styling, accessibility, and public-surface guidance.

The Detailed Guide is hosted in the public source repository and is not included in the package tarball.

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot)
- [`@hua-labs/motion-core`](https://www.npmjs.com/package/@hua-labs/motion-core)

## License

MIT — [HUA Labs](https://hua-labs.com)
