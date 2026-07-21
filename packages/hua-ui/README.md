# @hua-labs/ui

TypeScript-first React UI components with modular Web and React Native entry points.

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

## Detailed Guide

[Detailed Guide](./DETAILED_GUIDE.md) — Complete usage, API, styling, accessibility, and public-surface guidance.

The Detailed Guide is included in the package tarball.

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot)
- [`@hua-labs/motion-core`](https://www.npmjs.com/package/@hua-labs/motion-core)

## License

MIT — [HUA Labs](https://hua-labs.com)
